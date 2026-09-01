import mongoose, { Schema, models, model } from "mongoose";

export interface IAboutContent {
  _id: mongoose.Types.ObjectId;
  introHeading: string;
  introText: string;
  introImageMediaId?: mongoose.Types.ObjectId | null;
  missionHeading: string;
  missionText: string;
  approachHeading: string;
  approachText: string;
  approachImageMediaId?: mongoose.Types.ObjectId | null;
  whyChooseHeading: string;
  whyChooseText: string;
  ctaHeading: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  seo: { title: string; description: string };
  updatedAt: Date;
}

const AboutContentSchema = new Schema<IAboutContent>(
  {
    introHeading: { type: String, default: "About Swashray Immigration" },
    introText: {
      type: String,
      default:
        "Swashray Immigration Services Inc. was created to give individuals and families clear, organized, and professional guidance through immigration-related processes. We are currently building out our full company story — check back soon for more details about our background and team.",
    },
    introImageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    missionHeading: { type: String, default: "Our Mission" },
    missionText: {
      type: String,
      default:
        "To make the immigration process easier to understand by offering honest, organized, and personalized support at every step — without unrealistic promises.",
    },
    approachHeading: { type: String, default: "Our Approach" },
    approachText: {
      type: String,
      default:
        "We start by listening. Every situation is different, so we take the time to understand your goals before discussing possible options, required information, and next steps.",
    },
    approachImageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    whyChooseHeading: { type: String, default: "Why Clients Choose Us" },
    whyChooseText: {
      type: String,
      default:
        "Clear communication, organized processes, and a genuine commitment to helping you feel informed and supported throughout your immigration journey.",
    },
    ctaHeading: { type: String, default: "Ready to Get Started?" },
    ctaText: { type: String, default: "Book a consultation or send us an inquiry and let's discuss your situation." },
    ctaButtonText: { type: String, default: "Book a Consultation" },
    ctaButtonUrl: { type: String, default: "/booking" },
    seo: {
      title: { type: String, default: "About Us | Swashray Immigration Services Inc." },
      description: { type: String, default: "Learn about Swashray Immigration Services Inc. and our approach to immigration guidance." },
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.AboutContent || model<IAboutContent>("AboutContent", AboutContentSchema);
