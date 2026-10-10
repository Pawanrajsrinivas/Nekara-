import React from "react";
import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policy/PolicyLayout";
import { CONTACT_CONFIG } from "@/lib/contact-config";

export const metadata: Metadata = {
  title: "Return, Exchange & Refund Policy | NEKARA",
  description:
    "Review NEKARA's comprehensive 7-day return and exchange policy for luxury handloom sarees.",
};

export default function ReturnsPolicyPage() {
  return (
    <PolicyLayout
      title="Return, Exchange & Refund Policy"
      subtitle="Official Return & Exchange Policy"
      currentPath="/returns"
      intro="At NEKARA, we take immense pride in the craftsmanship, authenticity, and quality of our sarees. Because our textiles include delicate handloom weaves, intricate zari, and hand-finished embellishments, we maintain clear standards to protect product integrity while ensuring our patrons enjoy a fair, transparent return experience."
    >
      <div className="space-y-10 text-[#2C2C2C] font-serif leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            1. 7-Day Return &amp; Exchange Window
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            We offer a 7-day return and exchange window from the date of confirmed delivery. If you wish to initiate a return or exchange, you must contact our Concierge Team within 7 calendar days of receiving your parcel. Requests submitted after 7 calendar days cannot be honored.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            2. Eligibility Conditions
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            To qualify for a return, replacement, or store credit, the saree must satisfy all of the following conditions:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm sm:text-base text-[#2C2C2C]/85 font-sans">
            <li>The saree must be completely unused, unwashed, unaltered, and unpleated.</li>
            <li>All original NEKARA tags, care labels, Silk Mark certifications, and authenticity seals must remain fully intact and attached to the garment.</li>
            <li>The saree must be returned in its original artisanal packaging, including signature cloth garment bags, protective tissue, and sturdy outer box.</li>
            <li>The invoice or valid order receipt must accompany the return parcel.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            3. Non-Returnable &amp; Non-Exchangeable Items
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            For quality and hygiene reasons, the following items are strictly non-returnable and non-exchangeable:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm sm:text-base text-[#2C2C2C]/85 font-sans">
            <li>Sarees with unstitched blouse pieces cut, separated, stitched, hemmed, or altered in any manner.</li>
            <li>Sarees that have had custom fall and pico work requested by the patron.</li>
            <li>Customized, tailored, or bespoke bridal orders crafted specifically to personalized specifications.</li>
            <li>Products marked explicitly as &ldquo;Final Sale&rdquo; or purchased during special archival clearance promotions.</li>
            <li>Items returned with perfume scents, deodorant marks, stains, body oils, pet dander, or snagged zari threads caused post-delivery.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            4. Artisanal Handloom Variations (Not Defects)
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            Our sarees are woven by skilled traditional artisans using authentic wooden looms and genuine threads. Subtle variations in zari density, tiny slubs in natural silk yarns, minor shuttle transitions, and handcrafted weave irregularities are intrinsic characteristics of authentic handlooms and are not considered manufacturing defects.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            Similarly, although we shoot our products in calibrated natural studio lighting, slight tonal variations may appear across different mobile or desktop screens.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            5. Return Initiation Process
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            To start a return or exchange request:
          </p>
          <ol className="list-decimal list-outside pl-5 space-y-2.5 text-sm sm:text-base text-[#2C2C2C]/85 font-sans">
            <li>
              Send an email to{" "}
              {CONTACT_CONFIG.isRealEmailConfigured() ? (
                <a
                  href={CONTACT_CONFIG.getMailtoHref("Return Request")!}
                  className="font-medium text-[#1C3F3A] underline hover:text-[#B58A45] transition-colors"
                >
                  {CONTACT_CONFIG.supportEmail}
                </a>
              ) : (
                <span className="font-mono text-xs bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 text-amber-800">
                  {CONTACT_CONFIG.supportEmail}
                </span>
              )}{" "}
              or message our WhatsApp Concierge at{" "}
              {CONTACT_CONFIG.isRealWhatsAppConfigured() ? (
                <a
                  href={CONTACT_CONFIG.getWhatsAppHref("Hello NEKARA, I would like to request a return.")!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#1C3F3A] underline hover:text-[#B58A45] transition-colors"
                >
                  {CONTACT_CONFIG.whatsappNumber}
                </a>
              ) : (
                <span className="font-mono text-xs bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 text-amber-800">
                  {CONTACT_CONFIG.whatsappNumber}
                </span>
              )}
              .
            </li>
            <li>Include your 6-digit Order ID (e.g. #NK-XXXXXX), registered email address, and reason for return.</li>
            <li>Attach 2 to 3 clear, unedited photographs of the saree highlighting the tags intact, overall drape, and specific defect if reporting shipping damage.</li>
            <li>Our concierge team will review your request within 24 to 48 business hours and provide return dispatch instructions.</li>
          </ol>
        </section>

        {/* Section 6 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            6. Reverse Logistics &amp; Shipping Charges
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            If the return is due to a verifiable manufacturing defect, transit damage, or an incorrect item shipped by our warehouse, NEKARA will arrange reverse pick-up free of charge or reimburse standard domestic courier costs upon inspection approval.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            For returns initiated due to personal preference, color expectation, or voluntary cancellation where the product matches its catalog specifications, the client is responsible for safely couriering the parcel to our inspection warehouse using an insured, trackable service, or a flat nominal reverse logistics fee of ₹250 will be adjusted against the refund.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            7. Quality Inspection &amp; Refund Timelines
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            Once your return parcel arrives at our Bangalore fulfillment center, it undergoes an artisanal quality inspection within 3 business days.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            Upon approval:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm sm:text-base text-[#2C2C2C]/85 font-sans">
            <li>
              <strong>Original Payment Method (Razorpay):</strong> Refunds will be credited back to the original source card, net-banking account, or UPI handle within 5 to 7 business days, in accordance with standard bank clearing cycles.
            </li>
            <li>
              <strong>Store Credit / Gift Voucher:</strong> If opted, a NEKARA digital store credit code valid for 12 months will be issued immediately upon inspection pass.
            </li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            8. Exchange Policy
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            Clients may request a one-time exchange for another saree of equal or higher value, subject to inventory availability. If the replacement piece is of higher value, the difference must be settled prior to dispatch. If of lower value, the remaining balance will be provided as store credit.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            9. Concierge Assistance
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            For bespoke assistance regarding any return or exchange, our dedicated support team is available Monday through Saturday from 10:00 AM to 7:00 PM IST via email at{" "}
            {CONTACT_CONFIG.isRealEmailConfigured() ? (
              <a
                href={CONTACT_CONFIG.getMailtoHref("Return or Exchange Assistance")!}
                className="font-medium text-[#1C3F3A] underline hover:text-[#B58A45] transition-colors"
              >
                {CONTACT_CONFIG.supportEmail}
              </a>
            ) : (
              <span className="font-mono text-xs bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 text-amber-800">
                {CONTACT_CONFIG.supportEmail}
              </span>
            )}{" "}
            or WhatsApp Concierge at{" "}
            {CONTACT_CONFIG.isRealWhatsAppConfigured() ? (
              <a
                href={CONTACT_CONFIG.getWhatsAppHref("Hello NEKARA Concierge, I need assistance with an exchange.")!}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1C3F3A] underline hover:text-[#B58A45] transition-colors"
              >
                {CONTACT_CONFIG.whatsappNumber}
              </a>
            ) : (
              <span className="font-mono text-xs bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 text-amber-800">
                {CONTACT_CONFIG.whatsappNumber}
              </span>
            )}
            .
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
