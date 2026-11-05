import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Labmatrix Marketplace",
  description:
    "Terms and conditions governing the use of the Labmatrix Marketplace website and mobile app to buy, sell, or source certified laboratory instruments and spare parts.",
  alternates: {
    canonical: "/terms",
  },
};

const EFFECTIVE_DATE = "5 November 2026";
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

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
        <header className="space-y-2 border-b border-slate-100 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Terms of Service</h1>
          <p className="text-sm text-slate-500">Effective date: {EFFECTIVE_DATE}</p>
          <p className="text-sm leading-relaxed text-slate-700">
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the website at{" "}
            <Link href="/" className="text-brand-blue font-semibold hover:underline">
              surplus.labmatrixindia.com
            </Link>{" "}
            and the Labmatrix Market mobile application (together, the &quot;Service&quot;), operated by{" "}
            <strong>Labmatrix Instrument India Pvt Ltd</strong> (&quot;Labmatrix&quot;, &quot;we&quot;, &quot;us&quot;,
            or &quot;our&quot;).
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            By creating an account, listing equipment, posting sourcing requests, submitting inquiries, or otherwise
            using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not
            access or use the Service.
          </p>
        </header>

        <Section id="the-service" title="1. The Service and B2B Eligibility">
          <p>
            Labmatrix operates a specialized business-to-business (B2B) digital marketplace platform designed for
            pharmaceutical manufacturers, analytical testing laboratories, biotechnology companies, research
            institutes, universities, and certified service engineers.
          </p>
          <p>
            The Service enables registered participants to list, browse, inquire about, and source certified
            refurbished, pre-owned, and new analytical laboratory machinery (including HPLC, GC-MS, AAS, ICP, UV-Vis,
            FTIR, DSC-TGA systems) as well as genuine replacement spare parts, modules, and consumables.
          </p>
          <p>
            <strong>Eligibility.</strong> You must be at least 18 years of age and authorized to act on behalf of your
            business, laboratory, institution, or professional practice. By registering, you confirm that you have the
            authority to bind your organization to these Terms.
          </p>
        </Section>

        <Section id="account-registration" title="2. Account Registration and Security">
          <p>
            To list equipment, post buyer requirements, or submit inquiries, you must create an account using your email
            address and password, or through Google Sign-In. You agree to provide accurate, current, and complete
            information during registration and to keep your profile updated.
          </p>
          <p>
            <strong>Authentication Security.</strong> You are responsible for safeguarding your login credentials.
            One-time verification codes (OTPs) and password reset tokens sent to your email are confidential and must
            never be shared. Labmatrix staff will never ask you for your password or verification code.
          </p>
          <p>
            <strong>Unauthorized Use.</strong> You agree to notify us immediately at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-blue font-semibold hover:underline">
              {CONTACT_EMAIL}
            </a>{" "}
            if you suspect unauthorized access to your account. Labmatrix is not responsible for losses caused by
            unauthorized use of your account resulting from your failure to keep your credentials confidential.
          </p>
        </Section>

        <Section id="seller-obligations" title="3. Equipment Listings and Seller Obligations">
          <p>
            When listing laboratory machinery or spare parts for sale, sellers agree to the following standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Accurate Descriptions:</strong> All equipment details—including make, model, category, operational
              condition (e.g. Refurbished, Tested Working Surplus, Used Functional, Brand New with OEM Warranty),
              configuration, included detectors or modules, and known faults—must be accurate and truthful.
            </li>
            <li>
              <strong>Authentic Media:</strong> Photos and technical documentation (datasheets, calibration certificates,
              service records) must depict the actual unit offered for sale. Uploading stock photos that misrepresent the
              condition of pre-owned machinery is prohibited.
            </li>
            <li>
              <strong>Clear Title and Ownership:</strong> You warrant that you are the lawful owner of the equipment or
              are authorized by the owner to sell it, and that the item is free of liens, undisclosed leases, or third-party
              encumbrances.
            </li>
            <li>
              <strong>Decontamination and Safety:</strong> Any equipment previously exposed to chemical, bio-hazardous, or
              toxic substances must be thoroughly decontaminated in accordance with applicable industry standards prior to
              inspection or delivery.
            </li>
          </ul>
          <p>
            <strong>Admin Verification.</strong> All listings submitted to the Service undergo review by the Labmatrix
            technical team before being approved and published live. Labmatrix reserves the right to request additional
            verification documentation, re-classify categories, edit formatting for clarity, or decline any listing that
            does not satisfy our quality, verification, or safety criteria.
          </p>
        </Section>

        <Section id="buyer-requests" title="4. Buyer Sourcing Requests">
          <p>
            Laboratories and engineers may post sourcing requirements (&quot;Buyer Requests&quot;) for instruments, replacement
            boards, lamps, or specific catalog part numbers they are actively seeking to procure.
          </p>
          <p>
            <strong>Buyer Identity Protection:</strong> To shield laboratories from unsolicited spam and unauthorized
            outreach, buyer contact information (phone number, email, and institution) remains strictly confidential and
            is not exposed publicly on the request feed.
          </p>
          <p>
            <strong>Supplier Responses:</strong> Suppliers offering units against buyer requirements must ensure their
            proposals match the requested instrument specifications and are subject to verification by the Labmatrix Deal
            Desk.
          </p>
        </Section>

        <Section id="deal-desk-inspections" title="5. Inquiries, Deal Coordination and Technical Inspections">
          <p>
            Because high-precision analytical equipment (such as chromatography and mass spectrometry systems) requires
            meticulous technical evaluation, communications and quotations initiated on the Service are coordinated
            through the Labmatrix Deal Desk.
          </p>
          <p>
            <strong>Technical Inspections.</strong> Labmatrix facilitates on-site or high-definition video technical
            inspections, operational verification, calibration records checks, and module audits prior to final transaction
            closing.
          </p>
          <p>
            <strong>Independent Evaluation.</strong> While Labmatrix verifies listing parameters and technical data, buyers
            are encouraged to participate in pre-dispatch inspection protocols to confirm suitability for their specific
            pharmacopeial or testing application.
          </p>
        </Section>

        <Section id="pricing-transactions" title="6. Pricing, Quotations and Commercial Terms">
          <p>
            <strong>Indicative Pricing:</strong> Prices displayed on the Service (including price ranges or items marked
            &quot;Price on request&quot;) represent seller expectations or indicative commercial ranges. They do not constitute
            a legally binding unilateral contract until confirmed through a formal quotation, purchase order, or proforma
            invoice.
          </p>
          <p>
            <strong>Taxes and Logistics:</strong> Unless explicitly noted otherwise, quoted prices exclude applicable Goods
            and Services Tax (GST), specialized crating, transit insurance, freight delivery, on-site installation, and
            operational qualification (IQ/OQ), which are determined during transaction finalization.
          </p>
        </Section>

        <Section id="prohibited-items" title="7. Prohibited Equipment, Content and Conduct">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              List stolen, counterfeit, recalled, or unlawfully imported scientific machinery or components.
            </li>
            <li>
              List radioactive sources, regulated hazardous wastes, or biological agents restricted by applicable Indian
              or international regulations.
            </li>
            <li>
              Post misleading, fraudulent, defamatory, obscene, or infringing content.
            </li>
            <li>
              Attempt to bypass, compromise, or probe the security of the website, mobile app, API endpoints, or database.
            </li>
            <li>
              Use automated spiders, scrapers, or bots to harvest user data or catalog listings without prior written
              authorization.
            </li>
            <li>
              Engage in spamming, harassment, or unauthorized solicitation of platform members.
            </li>
          </ul>
        </Section>

        <Section id="intellectual-property" title="8. Intellectual Property and OEM Trademarks">
          <p>
            <strong>Labmatrix IP:</strong> All content, logos, user interface designs, software code, databases, and
            trademarks associated with Labmatrix and Labmatrix Instrument India Pvt Ltd are the exclusive property of
            Labmatrix and are protected under Indian and international copyright and trademark laws.
          </p>
          <p>
            <strong>Third-Party OEM Trademarks:</strong> Manufacturer names, logos, brand names, and part numbers referenced
            on the Service (such as Agilent, Waters, PerkinElmer, Shimadzu, Thermo Fisher, Metrohm, and others) are the
            trademarks of their respective original equipment manufacturers (OEMs). They are used on the platform solely for
            nominative, descriptive, and identification purposes to indicate instrument compatibility and original
            manufacture. Labmatrix is an independent marketplace provider and engineering firm unless explicitly designated
            as an authorized distributor.
          </p>
        </Section>

        <Section id="disclaimers" title="9. Disclaimers and Limitation of Liability">
          <p>
            The Service and all listings are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While Labmatrix
            conducts technical listing verification and deal coordination, we do not warrant that the Service will be
            uninterrupted, error-free, or entirely free of inaccuracies.
          </p>
          <p>
            Except for express written warranties or Annual Maintenance Contracts (AMC) executed directly by Labmatrix
            Instrument India Pvt Ltd in a separate commercial agreement, pre-owned and refurbished machinery is subject to
            the agreed inspection and handover protocols.
          </p>
          <p>
            To the fullest extent permitted by Indian law, Labmatrix Instrument India Pvt Ltd, its directors, officers, and
            employees shall not be liable for any indirect, incidental, punitive, special, or consequential damages,
            including loss of profits, laboratory downtime, test sample loss, or data corruption, arising out of or related
            to the use of the Service.
          </p>
        </Section>

        <Section id="termination-deletion" title="10. Account Deactivation and Termination">
          <p>
            <strong>User-Initiated Deletion:</strong> You may deactivate and delete your account at any time through the
            Account Settings section in the mobile app or on the website dashboard, as outlined in our{" "}
            <Link href="/privacy" className="text-brand-blue font-semibold hover:underline">
              Privacy Policy
            </Link>
            . Upon confirmation, your public listings and sourcing requests are immediately removed from the catalog.
          </p>
          <p>
            <strong>Termination by Labmatrix:</strong> We reserve the right to suspend or terminate accounts, remove
            listings, or restrict access to the Service for users who breach these Terms, submit fraudulent listings, or
            engage in conduct harmful to other participants or our operations.
          </p>
        </Section>

        <Section id="governing-law" title="11. Governing Law and Dispute Resolution">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of India, without
            regard to its conflict of law principles.
          </p>
          <p>
            Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or
            invalidity thereof shall be subject to the exclusive jurisdiction of the competent courts situated in{" "}
            <strong>New Delhi, India</strong>.
          </p>
        </Section>

        <Section id="changes" title="12. Amendments to Terms">
          <p>
            We may revise these Terms from time to time to reflect evolving business practices, platform updates, or legal
            requirements. When updates are published, the &quot;Effective date&quot; at the top of this page will be revised.
            Continued use of the Service following notice of changes constitutes acceptance of the amended Terms.
          </p>
        </Section>

        <Section id="contact" title="13. Contact Information and Grievance Officer">
          <p>
            If you have questions, feedback, or concerns regarding these Terms of Service, please contact our designated
            Grievance Officer:
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
          <p className="pt-2">You may also reach our corporate headquarters at:</p>
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
