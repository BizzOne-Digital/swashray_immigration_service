import mongoose, { Schema, models, model } from "mongoose";

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  businessDescription: string;
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    x: string;
    youtube: string;
  };
  logoMediaId?: mongoose.Types.ObjectId | null;
  faviconMediaId?: mongoose.Types.ObjectId | null;
  footerDescription: string;
  copyrightText: string;
  disclaimerText: string;
  seoDefaults: {
    title: string;
    description: string;
    keywords: string;
    ogImageMediaId?: mongoose.Types.ObjectId | null;
  };
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    businessName: { type: String, default: "Swashray Immigration Services Inc." },
    contactPerson: { type: String, default: "Kajal" },
    phone: { type: String, default: "(587) 717-2157" },
    email: { type: String, default: "blshukla@gmail.com" },
    address: { type: String, default: "" },
    businessDescription: {
      type: String,
      default:
        "Swashray Immigration Services Inc. offers professional guidance for individuals and families navigating visitor visas, sponsorships, work permits, study permits, passport services, and citizenship processes.",
    },
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      x: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    logoMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    faviconMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    footerDescription: {
      type: String,
      default:
        "Professional guidance for your immigration journey — from initial inquiry through every step of the process.",
    },
    copyrightText: {
      type: String,
      default: `© ${new Date().getFullYear()} Swashray Immigration Services Inc. All rights reserved.`,
    },
    disclaimerText: {
      type: String,
      default:
        "The information on this website is provided for general guidance only and does not constitute legal or immigration advice. Immigration policies, fees, processing times, and eligibility requirements change frequently. Please verify current requirements with official government sources or a qualified immigration professional before making decisions.",
    },
    seoDefaults: {
      title: { type: String, default: "Swashray Immigration Services Inc." },
      description: {
        type: String,
        default:
          "Professional guidance for your immigration journey. Visitor visas, sponsorships, work permits, study permits, passport services, and citizenship support.",
      },
      keywords: {
        type: String,
        default: "immigration services, visitor visa, sponsorship, work permit, study permit, citizenship, Canada immigration",
      },
      ogImageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.SiteSettings || model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
