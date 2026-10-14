import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message: string;
}

/**
 * Send contact inquiry emails via Resend:
 * 1. Notification to the LabMatrix Sales Team (sales@labmatrixindia.com)
 * 2. Auto-reply confirmation to the submitter
 */
export async function sendContactEmail(payload: ContactPayload) {
  const { name, email, phone, company, subject, message } = payload;
  const toEmail = process.env.CONTACT_TO_EMAIL || "sales@labmatrixindia.com";
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "LabMatrix Inquiries <onboarding@resend.dev>";

  if (!resend) {
    console.warn(
      "[Resend] RESEND_API_KEY is not defined. Email simulated in console:",
      { to: toEmail, from: fromEmail, payload }
    );
    return {
      success: true,
      simulated: true,
      message: "Resend API key not configured; inquiry logged in console.",
    };
  }

  // 1. Email to LabMatrix Sales Desk
  const salesHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>New Marketplace Inquiry</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 28px 32px; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #FBC634; margin-bottom: 6px;">
              LabMatrix Instrument India Pvt Ltd
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              New Website Inquiry Received
            </h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">
              Requirement: <strong style="color: #ffffff;">${subject}</strong>
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px;">
            <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 0; margin-bottom: 16px; font-weight: 700;">
              Lead & Contact Details
            </h2>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 140px;">Name:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Email Address:</td>
                  <td style="padding: 10px 0;">
                    <a href="mailto:${email}" style="color: #033A7D; text-decoration: none; font-weight: 600;">${email}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Mobile / Phone:</td>
                  <td style="padding: 10px 0;">
                    <a href="tel:${phone}" style="color: #033A7D; text-decoration: none; font-weight: 700;">${phone}</a>
                    <a href="https://wa.me/${phone.replace(/\\D/g, "")}" style="margin-left: 8px; color: #16a34a; font-size: 12px; font-weight: 600; text-decoration: none;">(WhatsApp)</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Company / Lab:</td>
                  <td style="padding: 10px 0; color: #0f172a;">${company || "Not Specified"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Category:</td>
                  <td style="padding: 10px 0; font-weight: 700; color: #033A7D;">${subject}</td>
                </tr>
              </tbody>
            </table>

            <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px; font-weight: 700;">
              Message Content
            </h2>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
${message}
            </div>

            <!-- Action Buttons -->
            <div style="margin-top: 28px; padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px;">
              <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(subject)}%20-%20LabMatrix%20Instrument%20India" style="display: inline-block; background-color: #033A7D; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 10px;">
                Reply via Email
              </a>
              <a href="tel:${phone}" style="display: inline-block; background-color: #f1f5f9; color: #1e293b; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 10px; margin-left: 10px;">
                Call: ${phone}
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #94a3b8; text-align: center;">
            Sent automatically by LabMatrix B2B Marketplace • 514/5, Mehrauli, New Delhi – 110030
          </div>
        </div>
      </body>
    </html>
  `;

  // 2. Email Confirmation to the Submitter
  const clientConfirmationHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Inquiry Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 28px 32px; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #FBC634; margin-bottom: 6px;">
              LabMatrix Instrument India Pvt Ltd
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              Thank You for Contacting Us
            </h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">
              We have received your inquiry and our engineering sales team will reach out shortly.
            </p>
          </div>

          <div style="padding: 32px;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; line-height: 1.6;">
              Dear <strong>${name}</strong>,
            </p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Thank you for reaching out to <strong>LabMatrix Instrument India Pvt. Ltd.</strong> regarding <strong>${subject}</strong>. Your inquiry has been routed to our technical support and procurement specialists.
            </p>

            <div style="background-color: #eff5fb; border-left: 4px solid #033A7D; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h3 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #033A7D; text-transform: uppercase;">
                Expected Response Time
              </h3>
              <p style="margin: 0; font-size: 13px; color: #334155;">
                We typically respond within <strong>2 to 4 business hours</strong> (Mon – Sat, 9:30 AM to 6:30 PM IST).
              </p>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
              If your requirement is urgent (such as an immediate equipment breakdown or active auction), you may connect with our hotline directly:
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="tel:+917303040804" style="display: inline-block; background-color: #FBC634; color: #033A7D; font-weight: 800; font-size: 14px; text-decoration: none; padding: 13px 28px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                📞 Call Direct: +91 7303040804
              </a>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.6;">
              <strong>Head Office:</strong><br />
              LABMATRIX INSTRUMENT INDIA PVT LTD<br />
              514/5, Mehrauli, New Delhi – 110030, India<br />
              Email: <a href="mailto:sales@labmatrixindia.com" style="color: #033A7D;">sales@labmatrixindia.com</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    // Dispatch to sales desk
    const salesResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `[Website Inquiry] ${name}${company ? ` (${company})` : ""} - ${subject}`,
      html: salesHtml,
    });

    // Attempt auto-reply to client
    try {
      await resend.emails.send({
        from: fromEmail,
        to: [email],
        replyTo: toEmail,
        subject: `We have received your inquiry - LabMatrix Instrument India`,
        html: clientConfirmationHtml,
      });
    } catch (clientErr) {
      console.warn("[Resend] Auto-reply confirmation failed (sales email succeeded):", clientErr);
    }

    return {
      success: true,
      data: salesResult,
    };
  } catch (error: any) {
    console.error("[Resend] Error sending contact email:", error);
    return {
      success: false,
      error: error?.message || "Failed to dispatch email via Resend",
    };
  }
}
