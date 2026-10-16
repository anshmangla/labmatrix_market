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

export interface SendOtpPayload {
  email: string;
  name?: string | null;
  otpCode: string;
}

/**
 * Send 6-digit registration verification OTP via Resend.
 */
export async function sendOtpEmail(payload: SendOtpPayload) {
  const { email, name, otpCode } = payload;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "LabMatrix Security <onboarding@resend.dev>";

  if (!resend) {
    console.log(
      `\n========================================\n[LOCAL OTP SIMULATION]\nTo: ${email}\nName: ${name || "User"}\nOTP Code: ${otpCode}\nValid for: 10 minutes\n========================================\n`
    );
    return {
      success: true,
      simulated: true,
      message: "RESEND_API_KEY not configured. OTP code simulated in console.",
    };
  }

  const otpHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Your LabMatrix Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 32px 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #FBC634; margin-bottom: 8px;">
              LabMatrix Instrument India
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              Email Verification Code
            </h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">
              Confirm your email address to activate your account
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px; text-align: center;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 20px; line-height: 1.5;">
              Hello${name ? ` <strong>${name}</strong>` : ""},<br />
              Please enter the following 6-digit verification code to complete your registration on the LabMatrix Marketplace:
            </p>

            <!-- OTP Display Card -->
            <div style="background-color: #f8fafc; border: 2px dashed #033A7D; border-radius: 16px; padding: 20px 24px; margin: 24px auto; max-width: 320px;">
              <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #02244E; display: inline-block; padding-left: 10px;">
                ${otpCode}
              </span>
            </div>

            <p style="font-size: 13px; color: #64748b; margin: 16px 0 0;">
              ⏱️ This verification code is valid for <strong>10 minutes</strong>.
            </p>

            <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 12px 16px; margin: 24px 0 0; text-align: left;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                <strong>Security Notice:</strong> LabMatrix will never ask you for your verification code or password via phone call or message. Do not share this code with anyone.
              </p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin: 20px 0 0; line-height: 1.5;">
              If you did not request this verification code, you can safely ignore this email. No account will be created without this verification step.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 32px; font-size: 11px; color: #94a3b8; text-align: center;">
            LABMATRIX INSTRUMENT INDIA PVT LTD • 514/5, Mehrauli, New Delhi – 110030<br />
            Support: <a href="mailto:sales@labmatrixindia.com" style="color: #033A7D; text-decoration: none;">sales@labmatrixindia.com</a> • Website: <a href="https://surplus.labmatrixindia.com" style="color: #033A7D; text-decoration: none;">surplus.labmatrixindia.com</a>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `Your LabMatrix Verification Code: ${otpCode}`,
      html: otpHtml,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("[Resend] Error sending OTP email:", error);
    return {
      success: false,
      error: error?.message || "Failed to dispatch verification code via email.",
    };
  }
}

