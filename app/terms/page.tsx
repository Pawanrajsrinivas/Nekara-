import React from "react";
import type { Metadata } from "next";
import { PolicyLayout } from "@/components/policy/PolicyLayout";
import { CONTACT_CONFIG } from "@/lib/contact-config";

export const metadata: Metadata = {
  title: "Terms & Conditions | NEKARA",
  description:
    "Review the terms and conditions governing purchases, digital transactions, intellectual property, and services on NEKARA.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms &amp; Conditions"
      subtitle="Official Terms &amp; Conditions"
      currentPath="/terms"
      intro="Welcome to NEKARA. By accessing our platform, registering an account, or placing an order for our sarees and textile products, you agree to be bound by the following Terms & Conditions. Please review them carefully before making a purchase."
    >
      <div className="space-y-10 text-[#2C2C2C] font-serif leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            1. Eligibility &amp; Platform Access
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            By using this website, you represent that you are at least 18 years of age or accessing the website under the direct supervision of a parent or legal guardian. You agree to provide accurate, current, and truthful information during checkout and account registration.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            2. Product Presentation &amp; Artisanal Nature
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            NEKARA curates handwoven sarees, artisanal textiles, and heritage drapes. We strive to present true-to-life photography, dimensions, thread counts, and fabric compositions. However, because handloom weaving is fundamentally human and artisanal:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm sm:text-base text-[#2C2C2C]/85 font-sans">
            <li>Minor discrepancies in yarn texture, zari luster, weave motifs, and dye lots are genuine hallmarks of craft, not manufacturing flaws.</li>
            <li>Color display may vary across electronic monitors, screens, and personal display color profiles.</li>
            <li>All dimensions (length and width) are standard 5.5m sarees with approximately 0.8m running blouse pieces, subject to slight hand-cut tolerances (&plusmn;2%).</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            3. Pricing &amp; Payments
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            All prices displayed on the NEKARA website are denominated in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless explicitly noted.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            Payment transactions are securely processed through authorized payment gateway partners (including Razorpay Software Private Limited). We do not store or capture raw credit card CVVs, net-banking passwords, or UPI PINs on our servers. You agree that you are legally authorized to utilize the payment method selected during checkout.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            4. Order Acceptance &amp; Inventory Allocation
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            Receipt of an order confirmation email or SMS signifies order placement, not automatic binding acceptance. NEKARA reserves the right to decline or cancel any order in whole or in part for valid commercial reasons, including:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm sm:text-base text-[#2C2C2C]/85 font-sans">
            <li>Unforeseen inventory unavailability or handloom defect detected during pre-dispatch quality checks.</li>
            <li>Pricing typographical errors or erroneous system discounts.</li>
            <li>Suspected fraudulent activity, unauthorized payment attempts, or non-deliverable PIN codes.</li>
          </ul>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            In the rare event of order cancellation post-successful payment, the full purchase value will be reversed immediately to your source payment method.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            5. Intellectual Property Rights
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            All content published on this website—including but not limited to the NEKARA trademark, brand insignia, logos, textual copywriting, studio photographs, lookbooks, illustrations, software code, and UI elements—is the exclusive intellectual property of NEKARA and protected by Indian and international copyright and trademark laws.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            No party may reproduce, republish, scrap, duplicate, sell, or distribute any part of our digital assets without prior explicit written permission.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            6. Limitation of Liability
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            To the maximum extent permitted by applicable law, NEKARA and its directors, artisans, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use our website or products.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            In all events, our total liability shall not exceed the actual rupee amount paid by you for the specific product giving rise to the claim.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            7. Governing Law &amp; Jurisdiction
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            These Terms &amp; Conditions and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to your purchase or browsing on NEKARA shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            8. Modifications to Terms
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            We reserve the right to amend, update, or replace any portion of these Terms &amp; Conditions by posting changes directly to this page. Your continued use of the website following any update signifies your acceptance of those modifications.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-4 pt-4 border-t border-[#B58A45]/20">
          <h2 className="font-serif text-xl sm:text-2xl text-[#1C3F3A] font-semibold tracking-wide">
            9. Contact &amp; Grievance Redressal
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#2C2C2C]/90 font-sans">
            If you have questions regarding our Terms &amp; Conditions or wish to file a formal grievance, please contact our Legal &amp; Compliance Officer at{" "}
            {CONTACT_CONFIG.isRealEmailConfigured() ? (
              <a
                href={CONTACT_CONFIG.getMailtoHref("Terms & Conditions Grievance")!}
                className="font-medium text-[#1C3F3A] underline hover:text-[#B58A45] transition-colors"
              >
                {CONTACT_CONFIG.supportEmail}
              </a>
            ) : (
              <span className="font-mono text-xs bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 text-amber-800">
                {CONTACT_CONFIG.supportEmail}
              </span>
            )}{" "}
            or write to our registered office: NEKARA Sarees &amp; Textiles, Bengaluru, Karnataka, India.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
