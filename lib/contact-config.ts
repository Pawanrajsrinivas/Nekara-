/**
 * NEKARA Luxury Sarees — Contact Configuration Module
 * 
 * Provides centralized, maintainable configuration for business contact details.
 * Prevents hardcoding broken URLs or non-functional mailto/tel links when placeholders are active.
 */

export const CONTACT_CONFIG = {
  brandName: "NEKARA",
  tagline: "Tradition, Woven with Elegance.",
  whatsappNumber: "[INSERT_NEKARA_WHATSAPP_NUMBER]",
  supportEmail: "[INSERT_NEKARA_SUPPORT_EMAIL]",

  isRealWhatsAppConfigured(): boolean {
    return Boolean(
      this.whatsappNumber &&
      !this.whatsappNumber.includes("[INSERT_") &&
      this.whatsappNumber.trim().length >= 8
    );
  },

  isRealEmailConfigured(): boolean {
    return Boolean(
      this.supportEmail &&
      !this.supportEmail.includes("[INSERT_") &&
      this.supportEmail.includes("@")
    );
  },

  getWhatsAppHref(text?: string): string | null {
    if (!this.isRealWhatsAppConfigured()) return null;
    const digitsOnly = this.whatsappNumber.replace(/[^0-9]/g, "");
    return `https://wa.me/${digitsOnly}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  },

  getMailtoHref(subject?: string): string | null {
    if (!this.isRealEmailConfigured()) return null;
    return `mailto:${this.supportEmail}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  },
};
