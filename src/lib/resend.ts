import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const BASE_URL =
  process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith("http")
    ? process.env.NEXTAUTH_URL
    : "https://surplus.labmatrixindia.com";

export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "LabMatrix Marketplace <notifications@surplus.labmatrixindia.com>";

export const ADMIN_SALES_EMAIL =
  process.env.ADMIN_NOTIF_EMAIL || process.env.CONTACT_TO_EMAIL || "sales@labmatrixindia.com";

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
  const toEmail = ADMIN_SALES_EMAIL;
  const fromEmail = DEFAULT_FROM_EMAIL;

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
  const fromEmail = DEFAULT_FROM_EMAIL;

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

/**
 * Send 6-digit password reset OTP via Resend.
 */
export async function sendPasswordResetOtpEmail(payload: SendOtpPayload) {
  const { email, name, otpCode } = payload;
  const fromEmail = DEFAULT_FROM_EMAIL;

  if (!resend) {
    console.log(
      `\n========================================\n[LOCAL PASSWORD RESET OTP SIMULATION]\nTo: ${email}\nName: ${name || "User"}\nReset OTP Code: ${otpCode}\nValid for: 10 minutes\n========================================\n`
    );
    return {
      success: true,
      simulated: true,
      message: "RESEND_API_KEY not configured. Password reset code simulated in console.",
    };
  }

  const otpHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Reset Your LabMatrix Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 32px 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #FBC634; margin-bottom: 8px;">
              LabMatrix Instrument India
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              Password Reset Request
            </h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">
              Use the verification code below to set a new password
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px; text-align: center;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 20px; line-height: 1.5;">
              Hello${name ? ` <strong>${name}</strong>` : ""},<br />
              We received a request to reset the password for your LabMatrix Marketplace account. Enter this 6-digit code on the reset page:
            </p>

            <!-- OTP Display Card -->
            <div style="background-color: #f8fafc; border: 2px dashed #033A7D; border-radius: 16px; padding: 20px 24px; margin: 24px auto; max-width: 320px;">
              <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #02244E; display: inline-block; padding-left: 10px;">
                ${otpCode}
              </span>
            </div>

            <p style="font-size: 13px; color: #64748b; margin: 16px 0 0;">
              ⏱️ This code will expire in <strong>10 minutes</strong>.
            </p>

            <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 12px 16px; margin: 24px 0 0; text-align: left;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                <strong>Security Alert:</strong> Never share this code with anyone. LabMatrix representatives will never ask for your verification code or password.
              </p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin: 20px 0 0; line-height: 1.5;">
              If you didn&apos;t make this request, you can safely ignore this email. Your current password remains active and secure.
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
      subject: `Your LabMatrix Password Reset Code: ${otpCode}`,
      html: otpHtml,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("[Resend] Error sending password reset OTP email:", error);
    return {
      success: false,
      error: error?.message || "Failed to dispatch password reset code via email.",
    };
  }
}

export interface AccountDeletionEmailPayload {
  email: string;
  name?: string | null;
}

/**
 * Send account deletion confirmation email via Resend.
 */
export async function sendAccountDeletionEmail(payload: AccountDeletionEmailPayload) {
  const { email, name } = payload;
  const fromEmail = DEFAULT_FROM_EMAIL;

  if (!resend) {
    console.log(
      `\n========================================\n[LOCAL ACCOUNT DELETION NOTICE SIMULATION]\nTo: ${email}\nName: ${name || "User"}\nNotice: Account and credentials successfully deactivated.\n========================================\n`
    );
    return {
      success: true,
      simulated: true,
      message: "RESEND_API_KEY not configured. Deletion email simulated in console.",
    };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>LabMatrix Account Deleted</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 32px 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #FBC634; margin-bottom: 8px;">
              LabMatrix Instrument India
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              Account Deactivated
            </h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">
              Confirmation of account removal and data archival
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px; text-align: left;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 16px; line-height: 1.5;">
              Hello${name ? ` <strong>${name}</strong>` : ""},<br /><br />
              This email confirms that your account on the <strong>LabMatrix Marketplace</strong> has been closed and deactivated.
            </p>

            <ul style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px; padding-left: 20px;">
              <li>Your login credentials and active sessions have been terminated.</li>
              <li>Your personal phone number and profile info have been removed.</li>
              <li>Your equipment listings and buyer requests have been removed from the public marketplace and archived for compliance.</li>
            </ul>

            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
                If this action was taken by mistake or you need assistance with previous transactions, please reach out directly to our operations desk at <a href="mailto:sales@labmatrixindia.com" style="color: #033A7D; font-weight: bold; text-decoration: none;">sales@labmatrixindia.com</a>.
              </p>
            </div>

            <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">
              Thank you for having been part of the LabMatrix community.
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
      subject: `Your LabMatrix Account Has Been Closed`,
      html,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("[Resend] Error sending account deletion email:", error);
    return {
      success: false,
      error: error?.message || "Failed to dispatch account closure email.",
    };
  }
}

export interface AdminNewListingPayload {
  listingId: string;
  title: string;
  category: string;
  itemType: string;
  minPrice: number;
  maxPrice: number;
  condition?: string | null;
  quantity?: number;
  location?: string | null;
  partNumber?: string | null;
  compatibleWith?: string | null;
  sellerName?: string | null;
  sellerEmail: string;
  sellerPhone?: string | null;
  sellerCompany?: string | null;
}

/**
 * Send email notification to sales@labmatrixindia.com whenever a new listing is submitted for admin review.
 */
export async function sendAdminNewListingEmail(payload: AdminNewListingPayload) {
  const {
    listingId,
    title,
    category,
    itemType,
    minPrice,
    maxPrice,
    condition,
    quantity,
    location,
    partNumber,
    compatibleWith,
    sellerName,
    sellerEmail,
    sellerPhone,
    sellerCompany,
  } = payload;

  const toEmail = ADMIN_SALES_EMAIL;
  const fromEmail = DEFAULT_FROM_EMAIL;
  const itemLabel =
    itemType === "SPARE_PART"
      ? "Spare Part"
      : itemType === "NEW_INSTRUMENT"
      ? "New Instrument"
      : "Pre-Owned Machine";

  if (!resend) {
    console.log(
      `\n========================================\n[LOCAL ADMIN NEW LISTING NOTIFICATION SIMULATION]\nTo: ${toEmail}\nListing: ${title} (${itemLabel})\nPrice: ₹${minPrice} - ₹${maxPrice}\nQuantity: ${quantity || 1}\nSeller: ${sellerName || "User"} (${sellerEmail}, ${sellerPhone || "No Phone"})\nAdmin Link: ${BASE_URL}/admin\n========================================\n`
    );
    return {
      success: true,
      simulated: true,
      message: "RESEND_API_KEY not configured. Admin listing email simulated in console.",
    };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>New Listing Awaiting Approval</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 28px 32px; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #FBC634; margin-bottom: 6px;">
              Admin Review Required • LabMatrix Marketplace
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              New ${itemLabel} Submitted
            </h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">
              A user has posted a new item that requires admin approval before appearing live.
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 32px;">
            <!-- Listing Details Section -->
            <h2 style="font-size: 15px; font-weight: 700; color: #02244E; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              📦 Listing Information
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 130px;">Title:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${title}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Type:</td>
                <td style="padding: 10px 0; color: #033A7D; font-weight: 600;">${itemLabel}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Category:</td>
                <td style="padding: 10px 0; color: #334155;">${category}</td>
              </tr>
              ${partNumber ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Part / Model #:</td>
                <td style="padding: 10px 0; color: #334155; font-family: monospace;">${partNumber}</td>
              </tr>` : ""}
              ${compatibleWith ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Compatible With:</td>
                <td style="padding: 10px 0; color: #334155;">${compatibleWith}</td>
              </tr>` : ""}
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Price Guide:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">₹${Number(minPrice).toLocaleString("en-IN")} – ₹${Number(maxPrice).toLocaleString("en-IN")}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Quantity:</td>
                <td style="padding: 10px 0; color: #334155;">${quantity || 1} unit(s)</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Condition:</td>
                <td style="padding: 10px 0; color: #334155;">${condition || "Used - Good"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Location:</td>
                <td style="padding: 10px 0; color: #334155;">${location || "India"}</td>
              </tr>
            </table>

            <!-- Submitter Details Section -->
            <h2 style="font-size: 15px; font-weight: 700; color: #02244E; margin: 20px 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              👤 Submitter / Seller Details
            </h2>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
              <p style="margin: 0 0 6px;"><strong>Name:</strong> ${sellerName || "Registered User"}</p>
              <p style="margin: 0 0 6px;"><strong>Email:</strong> <a href="mailto:${sellerEmail}" style="color: #033A7D; text-decoration: none;">${sellerEmail}</a></p>
              <p style="margin: 0 0 6px;"><strong>Phone:</strong> <a href="tel:${sellerPhone}" style="color: #033A7D; text-decoration: none;">${sellerPhone || "Not provided"}</a></p>
              <p style="margin: 0;"><strong>Company:</strong> ${sellerCompany || "Not specified"}</p>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="${BASE_URL}/admin" style="display: inline-block; background-color: #033A7D; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(3, 58, 125, 0.2);">
                Review &amp; Approve in Admin Portal →
              </a>
            </div>

            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
              This listing is currently hidden from the public marketplace. Once approved, the submitter will be automatically notified via email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #94a3b8; text-align: center;">
            LABMATRIX INSTRUMENT INDIA PVT LTD • Automated Admin Dispatch
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `[Action Required] New ${itemLabel} Submitted: "${title}"`,
      html,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Resend] Error sending admin new listing email:", error);
    return { success: false, error: error?.message || "Failed to notify admin via email." };
  }
}

export interface AdminNewRequirementPayload {
  requirementId: string;
  title: string;
  category: string;
  itemType: string;
  partNumber?: string | null;
  compatibleWith?: string | null;
  description: string;
  buyerName?: string | null;
  buyerEmail: string;
  buyerPhone?: string | null;
  buyerCompany?: string | null;
}

/**
 * Send email notification to sales@labmatrixindia.com whenever a new procurement requirement is submitted.
 */
export async function sendAdminNewRequirementEmail(payload: AdminNewRequirementPayload) {
  const {
    requirementId,
    title,
    category,
    itemType,
    partNumber,
    compatibleWith,
    description,
    buyerName,
    buyerEmail,
    buyerPhone,
    buyerCompany,
  } = payload;

  const toEmail = ADMIN_SALES_EMAIL;
  const fromEmail = DEFAULT_FROM_EMAIL;
  const itemLabel = itemType === "SPARE_PART" ? "Spare Part Requirement" : "Equipment Requirement";

  if (!resend) {
    console.log(
      `\n========================================\n[LOCAL ADMIN NEW REQUIREMENT NOTIFICATION SIMULATION]\nTo: ${toEmail}\nRequirement: ${title} (${itemLabel})\nBuyer: ${buyerName || "User"} (${buyerEmail}, ${buyerPhone || "No Phone"})\nAdmin Link: ${BASE_URL}/admin\n========================================\n`
    );
    return {
      success: true,
      simulated: true,
      message: "RESEND_API_KEY not configured. Admin requirement email simulated in console.",
    };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>New Procurement Request Awaiting Approval</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 28px 32px; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #FBC634; margin-bottom: 6px;">
              Admin Review Required • LabMatrix Marketplace
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              New ${itemLabel} Submitted
            </h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">
              A buyer has submitted a wanted equipment/part request for admin review.
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 32px;">
            <h2 style="font-size: 15px; font-weight: 700; color: #02244E; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              📋 Request Details
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600; width: 130px;">Item Wanted:</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${title}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Category:</td>
                <td style="padding: 10px 0; color: #334155;">${category}</td>
              </tr>
              ${partNumber ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Part / Model #:</td>
                <td style="padding: 10px 0; color: #334155; font-family: monospace;">${partNumber}</td>
              </tr>` : ""}
              ${compatibleWith ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Compatible With:</td>
                <td style="padding: 10px 0; color: #334155;">${compatibleWith}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: 600; vertical-align: top;">Description:</td>
                <td style="padding: 10px 0; color: #334155; line-height: 1.5;">${description}</td>
              </tr>
            </table>

            <h2 style="font-size: 15px; font-weight: 700; color: #02244E; margin: 20px 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              👤 Buyer Details
            </h2>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
              <p style="margin: 0 0 6px;"><strong>Name:</strong> ${buyerName || "Registered User"}</p>
              <p style="margin: 0 0 6px;"><strong>Email:</strong> <a href="mailto:${buyerEmail}" style="color: #033A7D; text-decoration: none;">${buyerEmail}</a></p>
              <p style="margin: 0 0 6px;"><strong>Phone:</strong> <a href="tel:${buyerPhone}" style="color: #033A7D; text-decoration: none;">${buyerPhone || "Not provided"}</a></p>
              <p style="margin: 0;"><strong>Company:</strong> ${buyerCompany || "Not specified"}</p>
            </div>

            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="${BASE_URL}/admin" style="display: inline-block; background-color: #033A7D; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(3, 58, 125, 0.2);">
                Review &amp; Approve in Admin Portal →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #94a3b8; text-align: center;">
            LABMATRIX INSTRUMENT INDIA PVT LTD • Automated Admin Dispatch
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `[Action Required] New ${itemLabel} Submitted: "${title}"`,
      html,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Resend] Error sending admin new requirement email:", error);
    return { success: false, error: error?.message || "Failed to notify admin via email." };
  }
}

export interface UserListingApprovedPayload {
  userEmail: string;
  userName?: string | null;
  listingId: string;
  title: string;
  itemType: string;
  category: string;
  minPrice: number;
  maxPrice: number;
}

/**
 * Send email notification to user ONLY AFTER admin approves their listing.
 */
export async function sendUserListingApprovedEmail(payload: UserListingApprovedPayload) {
  const { userEmail, userName, listingId, title, itemType, category, minPrice, maxPrice } = payload;
  const fromEmail = DEFAULT_FROM_EMAIL;

  const itemLabel =
    itemType === "SPARE_PART"
      ? "Spare Part"
      : itemType === "NEW_INSTRUMENT"
      ? "New Instrument"
      : "Equipment";

  const listingUrl =
    itemType === "SPARE_PART"
      ? `${BASE_URL}/spare-parts`
      : itemType === "NEW_INSTRUMENT"
      ? `${BASE_URL}/new-instruments`
      : `${BASE_URL}/listings/${listingId}`;

  if (!resend) {
    console.log(
      `\n========================================\n[LOCAL USER LISTING APPROVED NOTIFICATION SIMULATION]\nTo: ${userEmail}\nName: ${userName || "User"}\nListing: ${title} (${itemLabel})\nLive URL: ${listingUrl}\n========================================\n`
    );
    return {
      success: true,
      simulated: true,
      message: "RESEND_API_KEY not configured. User approval email simulated in console.",
    };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Your Listing is Live!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 32px 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #FBC634; margin-bottom: 8px;">
              LabMatrix Surplus Marketplace
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">
              🎉 Your Listing is Approved!
            </h1>
            <p style="margin: 8px 0 0; font-size: 14px; color: #cbd5e1;">
              Your item has passed admin verification and is now live on the marketplace.
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 20px; line-height: 1.6;">
              Hello${userName ? ` <strong>${userName}</strong>` : ""},<br /><br />
              We are pleased to inform you that your listing has been reviewed and approved by the LabMatrix engineering team. It is now published and accessible to buyers across India.
            </p>

            <!-- Listing Highlight Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin-bottom: 4px;">
                ● Live &amp; Available
              </div>
              <h3 style="margin: 0 0 8px; font-size: 17px; font-weight: 800; color: #0f172a;">
                ${title}
              </h3>
              <p style="margin: 0 0 6px; font-size: 13px; color: #64748b;">
                <strong>Type:</strong> ${itemLabel} &bull; <strong>Category:</strong> ${category}
              </p>
              <p style="margin: 0; font-size: 14px; color: #02244E; font-weight: 700;">
                Price: ₹${Number(minPrice).toLocaleString("en-IN")} – ₹${Number(maxPrice).toLocaleString("en-IN")}
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0 24px;">
              <a href="${listingUrl}" style="display: inline-block; background-color: #033A7D; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(3, 58, 125, 0.2);">
                View Your Live Listing →
              </a>
            </div>

            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
                💡 <strong>Next Steps:</strong> When interested buyers submit an inquiry for your equipment, our sales desk will connect directly with you to facilitate technical discussions and order execution.
              </p>
            </div>
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
      to: [userEmail],
      subject: `🎉 Your Listing is Approved & Live: "${title}"`,
      html,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Resend] Error sending user listing approval email:", error);
    return { success: false, error: error?.message || "Failed to dispatch approval email." };
  }
}

export interface UserRequirementApprovedPayload {
  userEmail: string;
  userName?: string | null;
  requirementId: string;
  title: string;
  itemType: string;
  category: string;
}

/**
 * Send email notification to user ONLY AFTER admin approves their procurement request.
 */
export async function sendUserRequirementApprovedEmail(payload: UserRequirementApprovedPayload) {
  const { userEmail, userName, requirementId, title, itemType, category } = payload;
  const fromEmail = DEFAULT_FROM_EMAIL;
  const requestUrl = `${BASE_URL}/requests/${requirementId}`;

  if (!resend) {
    console.log(
      `\n========================================\n[LOCAL USER REQUIREMENT APPROVED NOTIFICATION SIMULATION]\nTo: ${userEmail}\nName: ${userName || "User"}\nRequirement: ${title}\nLive URL: ${requestUrl}\n========================================\n`
    );
    return {
      success: true,
      simulated: true,
      message: "RESEND_API_KEY not configured. User request approval email simulated in console.",
    };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Your Procurement Request is Live!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #02244E 0%, #033A7D 100%); padding: 32px 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #FBC634; margin-bottom: 8px;">
              LabMatrix Surplus Marketplace
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">
              🎉 Your Request is Approved!
            </h1>
            <p style="margin: 8px 0 0; font-size: 14px; color: #cbd5e1;">
              Your requirement has been verified and is now visible to suppliers on the marketplace.
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px;">
            <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 20px; line-height: 1.6;">
              Hello${userName ? ` <strong>${userName}</strong>` : ""},<br /><br />
              Your procurement request for <strong>${title}</strong> has been approved by our admin team. Verified suppliers and equipment owners can now review your requirement and submit matching solutions.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin-bottom: 4px;">
                ● Published &amp; Sourcing Active
              </div>
              <h3 style="margin: 0 0 8px; font-size: 17px; font-weight: 800; color: #0f172a;">
                ${title}
              </h3>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                <strong>Category:</strong> ${category}
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0 24px;">
              <a href="${requestUrl}" style="display: inline-block; background-color: #033A7D; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(3, 58, 125, 0.2);">
                View Your Live Request →
              </a>
            </div>
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
      to: [userEmail],
      subject: `🎉 Your Request is Approved & Live: "${title}"`,
      html,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Resend] Error sending user requirement approval email:", error);
    return { success: false, error: error?.message || "Failed to dispatch approval email." };
  }
}


