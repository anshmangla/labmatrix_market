import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Labmatrix Marketplace",
  description:
    "How Labmatrix Instrument India Pvt Ltd collects, uses, shares and protects your information on the Labmatrix Marketplace website and mobile app, and how to delete your account.",
  alternates: {
    canonical: "/privacy",
  },
};

const EFFECTIVE_DATE = "4 November 2026";
const CONTACT_EMAIL = "sales@labmatrixindia.com";
const GRIEVANCE_OFFICER = "Pradeep Sharma";
const GRIEVANCE_EMAIL = "pradeep.sharma@labmatrixindia.com";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
        <header className="space-y-2 border-b border-slate-100 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Effective date: {EFFECTIVE_DATE}</p>
          <p className="text-sm leading-relaxed text-slate-700">
            This policy explains how <strong>Labmatrix Instrument India Pvt Ltd</strong> (&quot;Labmatrix&quot;,
            &quot;we&quot;, &quot;us&quot;) collects, uses, shares and protects information when you use the
            Labmatrix Marketplace website at{" "}
            <Link href="/" className="text-brand-blue font-semibold hover:underline">
              surplus.labmatrixindia.com
            </Link>{" "}
            and the Labmatrix Market mobile app (together, the &quot;Service&quot;). The Service is a
            business-to-business marketplace for buying and selling laboratory instruments, spare parts and
            consumables.
          </p>
        </header>

        <Section id="information-we-collect" title="1. Information we collect">
          <p>
            <strong>Account information.</strong> When you register, we collect your name, email address and a
            password. Passwords are stored only as a one-way hash and are never visible to us. You may also give
            us your mobile number and company or institution name, either at registration or when you post a
            listing or request.
          </p>
          <p>
            <strong>Google sign-in.</strong> If you choose &quot;Continue with Google&quot;, Google shares your
            name, email address and profile picture with us. We do not receive your Google password.
          </p>
          <p>
            <strong>Listings and requests.</strong> When you list equipment or post a sourcing request, we
            collect the details you enter (such as title, description, category, condition, price range, part
            numbers, quantity and the city or location you type in), any photos you upload, and any documents
            (such as equipment datasheets, calibration reports, user manuals, or specification sheets in PDF format)
            you choose to attach.
          </p>
          <p>
            <strong>Inquiries and messages.</strong> When you send an inquiry about a listing or request, or use
            our contact form, we collect your message along with the contact details you provide (name, email,
            phone and company).
          </p>
          <p>
            <strong>Email verification and password reset.</strong> We send one-time codes to your email address
            to verify it or to reset your password. Codes are stored only in hashed form and expire after 10
            minutes.
          </p>
          <p>
            <strong>Technical information.</strong> To keep the Service secure (for example, to limit repeated
            login attempts), our servers briefly use your IP address. Our hosting provider may also keep standard
            server logs, such as IP address, browser or device type, and the time of a request, for security and
            reliability.
          </p>
          <p>
            We do <strong>not</strong> use advertising, analytics or tracking tools, and we do not collect your
            precise location, contacts or call logs.
          </p>
        </Section>

        <Section id="app-permissions" title="2. Camera, photo and document access (mobile app)">
          <p>
            The mobile app asks for access to your <strong>camera</strong>, <strong>photo library</strong>, and
            <strong>document storage</strong> only when you choose to take photos or attach files (such as instrument photos
            or specification PDFs) to equipment you are listing or sourcing. Only the specific photos or documents you
            select in the device picker are uploaded. We do not scan, index, or access any other files on your device.
            The app does not record audio or access your microphone. You can withdraw permissions at any time in your
            device settings; you can still use the rest of the app.
          </p>
          <p>
            The app stores your sign-in token securely on your device (in the device&apos;s encrypted secure
            storage) so you stay signed in. The website uses an essential session cookie for the same purpose.
          </p>
        </Section>

        <Section id="how-we-use" title="3. How we use your information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To create and manage your account and keep you signed in.</li>
            <li>To publish your listings and requests after admin review.</li>
            <li>
              To broker deals: our deal desk uses your contact details to connect buyers and sellers, arrange
              inspections and follow up on inquiries.
            </li>
            <li>
              To send you service emails and in-app notifications, such as verification codes, password resets,
              listing approvals, inquiry alerts and account notices.
            </li>
            <li>To respond to messages you send us through the contact form.</li>
            <li>To protect the Service against fraud, abuse, spam and unauthorised access.</li>
          </ul>
          <p>We do not sell your personal information, and we do not use it for third-party advertising.</p>
        </Section>

        <Section id="what-is-public" title="4. What other users can see">
          <p>
            Approved listings and requests are public. Their title, description, category, condition, price
            range, part numbers, location and photos are visible to anyone. Please do not put personal contact
            details in these fields.
          </p>
          <p>
            Your name, email address, phone number and company are <strong>not</strong> shown publicly and are
            not shared directly with other buyers or sellers. Labmatrix administrators can see them so our deal
            desk can coordinate transactions.
          </p>
        </Section>

        <Section id="sharing" title="5. Service providers we share data with">
          <p>
            We use the following providers to run the Service. They process data on our behalf and only for
            these purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Vercel</strong>: hosts the website and the app&apos;s server (Singapore region).
            </li>
            <li>
              <strong>Neon</strong>: stores the marketplace database (Singapore region).
            </li>
            <li>
              <strong>Cloudinary</strong>: stores and serves the photos you upload.
            </li>
            <li>
              <strong>Resend</strong>: delivers our emails, such as verification codes, notifications and contact
              form messages.
            </li>
            <li>
              <strong>Google</strong>: provides sign-in, only if you choose to use it.
            </li>
          </ul>
          <p>
            We may also disclose information if required by law, or to protect the rights, safety and property
            of Labmatrix, our users or others.
          </p>
        </Section>

        <Section id="security" title="6. How we protect your information">
          <p>
            All data is sent over encrypted HTTPS connections. Passwords and verification codes are stored only
            as hashes. Access to administrative tools is restricted to authorised Labmatrix staff. Sessions are
            revoked when you change your password or delete your account. No system is completely secure, but we
            work to protect your information and fix issues promptly.
          </p>
        </Section>

        <Section id="retention" title="7. How long we keep information">
          <p>
            We keep your account information for as long as your account is active. Verification codes expire
            after 10 minutes. When you delete your account, we remove your personal information as described
            below. We retain limited transaction records, such as inquiry history, where needed for legal,
            accounting, dispute-resolution or regulatory purposes.
          </p>
        </Section>

        <Section id="delete-account" title="8. Deleting your account and data">
          <p>You can delete your account at any time, without needing to contact us:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>In the mobile app:</strong> open <strong>Profile</strong> → <strong>Account Settings</strong>{" "}
              → <strong>Deactivate &amp; Delete My Account</strong>, then confirm. Accounts with a password are
              asked to enter it.
            </li>
            <li>
              <strong>On the website:</strong> sign in, go to{" "}
              <Link href="/dashboard" className="text-brand-blue font-semibold hover:underline">
                Dashboard
              </Link>{" "}
              → <strong>Account Settings</strong> → <strong>Deactivate &amp; Delete My Account</strong>, then
              confirm.
            </li>
            <li>
              <strong>By email:</strong> if you cannot sign in, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-blue font-semibold hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              from the address registered on your account, with the subject &quot;Account deletion
              request&quot;. We will verify the request and complete it within 30 days.
            </li>
          </ul>
          <p>When your account is deleted:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Your name, email address, phone number, company, password and profile picture are removed from your
              account.
            </li>
            <li>Your listings and requests are removed from public view.</li>
            <li>Your notifications, linked Google sign-in and active sessions are deleted.</li>
            <li>
              Historical inquiry and transaction records are kept, linked only to the anonymised account, where
              needed for legal, accounting or dispute-resolution purposes.
            </li>
          </ul>
          <p>
            When you delete your account yourself in the app or on the website, we send a confirmation email to
            your original address.
          </p>
        </Section>

        <Section id="your-rights" title="9. Your rights">
          <p>
            You can view and update your name, phone number and company at any time from your profile settings.
            Subject to applicable law, including India&apos;s Digital Personal Data Protection Act, 2023, you may
            also ask us for a summary of the personal data we hold about you, ask us to correct or erase it, or
            withdraw consent. To make a request or raise a concern, contact our Grievance Officer using the
            details below.
          </p>
        </Section>

        <Section id="children" title="10. Children">
          <p>
            The Service is intended for businesses and professionals and is not directed to anyone under 18. We
            do not knowingly collect personal information from children. If you believe a child has given us
            personal information, please contact us and we will delete it.
          </p>
        </Section>

        <Section id="changes" title="11. Changes to this policy">
          <p>
            We may update this policy from time to time. We will post the updated version on this page with a new
            effective date. If we make significant changes, we will notify you by email or in the app.
          </p>
        </Section>

        <Section id="contact" title="12. Contact us and Grievance Officer">
          <p>
            For privacy questions, requests or grievances, including under India&apos;s Digital Personal Data
            Protection Act, 2023, contact our Grievance Officer:
          </p>
          <address className="not-italic text-sm text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">{GRIEVANCE_OFFICER}, Grievance Officer</p>
            <p>
              Email:{" "}
              <a href={`mailto:${GRIEVANCE_EMAIL}`} className="text-brand-blue font-semibold hover:underline">
                {GRIEVANCE_EMAIL}
              </a>
            </p>
          </address>
          <p>For anything else, you can reach the company at:</p>
          <address className="not-italic text-sm text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">Labmatrix Instrument India Pvt Ltd</p>
            <p>514/5, Mehrauli, New Delhi – 110030, India</p>
            <p>
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-blue font-semibold hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>
              Phone:{" "}
              <a href="tel:+917303040804" className="text-brand-blue font-semibold hover:underline">
                +91 7303040804
              </a>
            </p>
          </address>
        </Section>
      </article>
    </div>
  );
}
