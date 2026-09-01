import mongoose, { Schema, models, model } from "mongoose";

export interface IFaqItem {
  question: string;
  answer: string;
}

export interface IService {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  whoItsFor: string;
  process: string;
  featuredImageMediaId?: mongoose.Types.ObjectId | null;
  images: mongoose.Types.ObjectId[];
  icon: string;
  ctaText: string;
  ctaUrl: string;
  faq: IFaqItem[];
  order: number;
  active: boolean;
  seo: { title: string; description: string };
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    whoItsFor: { type: String, default: "" },
    process: { type: String, default: "" },
    featuredImageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    images: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    icon: { type: String, default: "FileCheck" },
    ctaText: { type: String, default: "Book a Consultation" },
    ctaUrl: { type: String, default: "/booking" },
    faq: { type: [{ question: String, answer: String }], default: [] },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default models.Service || model<IService>("Service", ServiceSchema);
