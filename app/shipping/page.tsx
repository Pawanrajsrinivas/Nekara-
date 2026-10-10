import React from "react";
import Link from "next/link";
import { PolicyLayout } from "@/components/policy/PolicyLayout";
import { CONTACT_CONFIG } from "@/lib/contact-config";

export const metadata = {
  title: "Shipping & Delivery Policy | NEKARA",
  description: "Official shipping and delivery terms, dispatch schedules, and courier partners for NEKARA sarees across India.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      subtitle="Official Shipping Policy"
      currentPath="/shipping"
      intro="At NEKARA, every saree carries a story of elegance and tradition. We take great care in preparing your order and ensuring it reaches you safely, wherever you are in India. Our goal is to make your shopping experience smooth, reliable, and convenient — from placing your order to receiving your saree."
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          1. Shipping Across India
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          NEKARA delivers orders across India. We work with established third-party courier and logistics partners to deliver your purchases safely and efficiently.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Depending on service availability at your delivery location, your order may be shipped through one of the following delivery partners:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#3A2115]/85">
          <li>Delhivery</li>
          <li>Blue Dart</li>
          <li>Shadowfax</li>
          <li>DTDC</li>
          <li>Ekart</li>
          <li>XpressBees</li>
        </ul>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          The delivery partner is selected based on availability and serviceability for your location.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#B58A45]/15">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          2. Order Processing &amp; Dispatch
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Once your order is successfully placed, our team will verify the order details and product availability before preparing it for dispatch.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Orders are generally processed and dispatched within 1–3 business days, excluding Sundays and public holidays.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Each order is carefully packed before being handed over to the selected delivery partner.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#B58A45]/15">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          3. Shipping Charges
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Applicable shipping charges will be displayed at checkout before you complete your purchase.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Please review the final order amount, including shipping charges, before confirming your order.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#B58A45]/15">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          4. Estimated Delivery Time
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Delivery timelines may vary depending on your location, courier partner, and service availability.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Once your order has been dispatched, the time taken for delivery will depend on the selected logistics partner and destination.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Delivery timelines are estimates and may be affected by courier delays, weather conditions, public holidays, or other unforeseen circumstances.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#B58A45]/15">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          5. Order Tracking
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Where tracking is available, shipment details will be shared with you after dispatch so you can follow your order’s progress.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Please use the tracking information provided to check the latest shipment status.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          If you have questions about your order or its delivery status, you may contact NEKARA through our official customer support channels.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#B58A45]/15">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          6. Shipping Address &amp; Delivery Details
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Please ensure that your name, shipping address, mobile number, and other required details are accurate when placing your order.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Incorrect or incomplete information may cause delivery delays or unsuccessful delivery attempts.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          If you need to correct your delivery details, contact us as soon as possible. Changes may not be possible after the order has been dispatched.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#B58A45]/15">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          7. Delays &amp; Delivery Issues
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Although we make every effort to ensure a smooth delivery experience, delays may occasionally occur due to circumstances beyond our control.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          If your order is delayed, tracking information is unavailable, or you experience a delivery issue, please contact our customer support team with your order details so we can assist you.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#B58A45]/15">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          8. Exchange Policy — No Returns
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          At NEKARA, we currently follow an exchange-only policy. Returns are not accepted.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          If you receive a damaged, defective, or incorrect saree, please contact our customer support team with your order details and clear photographs of the product and packaging.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Our team will review the concern and guide you regarding the applicable exchange process.
        </p>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          Please refer to our{" "}
          <Link
            href="/returns"
            className="text-[#075E5A] font-semibold underline hover:text-[#02221D]"
          >
            Return, Exchange &amp; Refund Policy
          </Link>{" "}
          page for the complete terms and conditions governing exchanges.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#B58A45]/15">
        <h2 className="font-serif text-xl sm:text-2xl text-[#02221D] font-normal tracking-wide">
          9. Contact Us
        </h2>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed">
          For questions regarding shipping, dispatch, tracking, or delivery, please reach out to NEKARA through our official customer support channels:
        </p>
        <div className="bg-[#FAF5ED] border border-[#B58A45]/25 p-4 rounded-xs text-sm sm:text-base space-y-2">
          <div>
            <span className="font-semibold text-[#02221D]">WhatsApp: </span>
            {CONTACT_CONFIG.isRealWhatsAppConfigured() ? (
              <a
                href={CONTACT_CONFIG.getWhatsAppHref("Hello NEKARA, I have a query regarding shipping.")!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#075E5A] underline font-medium"
              >
                {CONTACT_CONFIG.whatsappNumber}
              </a>
            ) : (
              <span className="font-mono text-[#02221D]">{CONTACT_CONFIG.whatsappNumber}</span>
            )}
          </div>
          <div>
            <span className="font-semibold text-[#02221D]">Email: </span>
            {CONTACT_CONFIG.isRealEmailConfigured() ? (
              <a
                href={CONTACT_CONFIG.getMailtoHref("Shipping & Delivery Query")!}
                className="text-[#075E5A] underline font-medium"
              >
                {CONTACT_CONFIG.supportEmail}
              </a>
            ) : (
              <span className="font-mono text-[#02221D]">{CONTACT_CONFIG.supportEmail}</span>
            )}
          </div>
        </div>
        <p className="text-sm sm:text-base text-[#3A2115]/85 leading-relaxed pt-2">
          We appreciate your trust in NEKARA and look forward to bringing our collections to your doorstep.
        </p>
        <p className="font-serif text-sm sm:text-base text-[#02221D] font-medium pt-1 italic">
          NEKARA — Tradition, Woven with Elegance.
        </p>
      </section>
    </PolicyLayout>
  );
}
