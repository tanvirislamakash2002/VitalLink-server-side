/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import status from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { generateInvoicePdf } from "./payment.utils";


const handlerStripeWebhookEvent = async (event : Stripe.Event) =>{

    const existingPayment = await prisma.payment.findFirst({
        where:{
            stripeEventId : event.id
        }
    })

    if(existingPayment){
        console.log(`Event ${event.id} already processed. Skipping`);
        return {message : `Event ${event.id} already processed. Skipping`}
    }

    switch(event.type){
        case "checkout.session.completed": {
            const session = event.data.object as any;

            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;

            if (!appointmentId || !paymentId) {
                console.error("⚠️ Missing metadata in webhook event");
                return { message: "Missing metadata" };
            }

            // Verify appointment exists with related data
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    patient: true,
                    doctor: true,
                    schedule: true,
                    payment: true
                }
            });

            if (!appointment) {
                console.error(`⚠️ Appointment ${appointmentId} not found. Payment may be for expired appointment.`);
                return { message: "Appointment not found" };
            }
            let pdfBuffer: Buffer | null = null;

            // Update both appointment and payment in a transaction
            const result = await prisma.$transaction(async (tx) => {
                const updatedAppointment = await tx.appointment.update({
                    where: {
                        id: appointmentId
                    },
                    data: {
                        paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                    }
                });

                let invoiceUrl = null;
                

                // If payment is successful, generate and upload invoice
                if (session.payment_status === "paid") {
                    try {
                        // Generate invoice PDF
                        pdfBuffer = await generateInvoicePdf({
                            invoiceId: appointment.payment?.id || paymentId,
                            patientName: appointment.patient.name,
                            patientEmail: appointment.patient.email,
                            doctorName: appointment.doctor.name,
                            appointmentDate: appointment.schedule.startDateTime.toString(),
                            amount: appointment.payment?.amount || 0,
                            transactionId: appointment.payment?.transactionId || "",
                            paymentDate: new Date().toISOString()
                        });

                        // Upload PDF to Cloudinary
                        const cloudinaryResponse = await uploadFileToCloudinary(
                            pdfBuffer,
                            `ph-healthcare/invoices/invoice-${paymentId}-${Date.now()}.pdf`
                        );

                        invoiceUrl = cloudinaryResponse?.secure_url;

                        console.log(`✅ Invoice PDF generated and uploaded for payment ${paymentId}`);
                    } catch (pdfError) {
                        console.error("❌ Error generating/uploading invoice PDF:", pdfError);
                        // Continue with payment update even if PDF generation fails
                    }
                }

                const updatedPayment = await tx.payment.update({
                    where: {
                        id: paymentId
                    },
                    data: {
                        status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        paymentGatewayData: session,
                        invoiceUrl: invoiceUrl, // Store invoice URL
                        stripeEventId: event.id // Store event ID for idempotency
                    }
                });

                return { updatedAppointment, updatedPayment, invoiceUrl };
            });

            // Send invoice email to patient (outside transaction to avoid blocking payment update)
            if (session.payment_status === "paid" && result.invoiceUrl) {
                try {
                    await sendEmail({
                        to: appointment.patient.email,
                        subject: `Payment Confirmation & Invoice - Appointment with ${appointment.doctor.name}`,
                        templateName: "invoice",
                        templateData: {
                            patientName: appointment.patient.name,
                            invoiceId: appointment.payment?.id || paymentId,
                            transactionId: appointment.payment?.transactionId || "",
                            paymentDate: new Date().toLocaleDateString(),
                            doctorName: appointment.doctor.name,
                            appointmentDate: new Date(appointment.schedule.startDateTime).toLocaleDateString(),
                            amount: appointment.payment?.amount || 0,
                            invoiceUrl: result.invoiceUrl
                        },
                        attachments: [
                            {
                                filename: `Invoice-${paymentId}.pdf`,
                                content: pdfBuffer || Buffer.from(""), // Attach PDF if generated, else empty buffer
                                contentType: 'application/pdf'
                            }
                        ]
                    });

                    console.log(`✅ Invoice email sent to ${appointment.patient.email}`);
                } catch (emailError) {
                    console.error("❌ Error sending invoice email:", emailError);
                    // Log but don't fail the payment if email fails
                }
            }

            console.log(`✅ Payment ${session.payment_status} for appointment ${appointmentId}`);
            break;
        }

        case "checkout.session.expired" : {
                const session = event.data.object

                console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);
                break;

        }
        case "payment_intent.payment_failed" : {
            const session = event.data.object

            console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);
            break;
        }
        default :
            console.log(`Unhandled event type ${event.type}`);
    }

    return {message : `Webhook Event ${event.id} processed successfully`}
}

const confirmCheckoutSession = async (sessionId: string, user: IRequestUser) => {
    if (!sessionId) {
        throw new AppError(status.BAD_REQUEST, "Checkout session ID is required");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const appointmentId = session.metadata?.appointmentId;
    const paymentId = session.metadata?.paymentId;

    if (!appointmentId || !paymentId || session.mode !== "payment") {
        throw new AppError(status.BAD_REQUEST, "Checkout session is not linked to an appointment");
    }

    const patient = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email },
        select: { id: true },
    });
    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, patientId: patient.id },
        include: { payment: true },
    });

    if (!appointment || !appointment.payment || appointment.payment.id !== paymentId) {
        throw new AppError(status.NOT_FOUND, "Appointment payment was not found");
    }

    if (session.payment_status !== "paid") {
        return { appointmentId, paymentStatus: appointment.paymentStatus };
    }

    await prisma.$transaction([
        prisma.appointment.update({
            where: { id: appointmentId },
            data: { paymentStatus: PaymentStatus.PAID },
        }),
        prisma.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.PAID },
        }),
    ]);

    return { appointmentId, paymentStatus: PaymentStatus.PAID };
}

export const PaymentService = {
    handlerStripeWebhookEvent,
    confirmCheckoutSession,
}