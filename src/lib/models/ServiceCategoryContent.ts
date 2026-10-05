import mongoose, { Schema, models, model } from "mongoose";

/**
 * Admin-editable backing store for the in-depth Services hierarchy shown at
 *   /services, /services/[category], /services/[category]/[service],
 *   /services/[category]/[service]/[program]
 *
 * This replaces the plain-TypeScript content that used to live in
 * src/lib/servicesData/*.ts (now migrated in via scripts/migrateServiceContent.ts
 * and left in place only as the one-time migration source / fallback typings).
 * One document per category (6 total), with services and programs embedded
 * as subdocuments so the whole category — and everything under it — saves
 * in a single admin form submission.
 *
 * Every content node (category/service/program) keeps its original static
 * `image` path as a fallback and an optional `imageMediaId` the admin can
 * set via the media library to override it — mirrors the same
 * override-the-default pattern used for the site logo (see Logo.tsx).
 */

export interface IFaqEntry {
  question: string;
  answer: string;
}

export interface IProcessStep {
  title: string;
  text: string;
}

export interface IProgramContent {
  _id?: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  shortDescription: string;
  suitableFor: string;
  icon: string;
  image: string;
  imageMediaId?: mongoose.Types.ObjectId | null;
  overview: string[];
  eligibility: string[];
  process: IProcessStep[];
  documents: string[];
  commonIssues: string[];
  howWeHelp: string[];
  keyConsiderations: string[];
  faq: IFaqEntry[];
  seoTitle: string;
  seoDescription: string;
  order: number;
}

export interface IServiceContent {
  _id?: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  shortDescription: string;
  suitableFor: string;
  icon: string;
  image: string;
  imageMediaId?: mongoose.Types.ObjectId | null;
  overview: string[];
  eligibility: string[];
  process: IProcessStep[];
  documents: string[];
  commonIssues: string[];
  howWeHelp: string[];
  faq: IFaqEntry[];
  relatedSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  order: number;
  programs: IProgramContent[];
}

export interface IServiceCategoryContent {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title: string;
  shortDescription: string;
  intro: string[];
  icon: string;
  image: string;
  imageMediaId?: mongoose.Types.ObjectId | null;
  order: number;
  services: IServiceContent[];
  createdAt: Date;
  updatedAt: Date;
}

const ProcessStepSchema = new Schema<IProcessStep>({ title: String, text: String }, { _id: false });
const FaqEntrySchema = new Schema<IFaqEntry>({ question: String, answer: String }, { _id: false });

const ProgramContentSchema = new Schema<IProgramContent>({
  slug: { type: String, required: true },
  title: { type: String, default: "" },
  shortDescription: { type: String, default: "" },
  suitableFor: { type: String, default: "" },
  icon: { type: String, default: "FileCheck" },
  image: { type: String, default: "" },
  imageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
  overview: { type: [String], default: [] },
  eligibility: { type: [String], default: [] },
  process: { type: [ProcessStepSchema], default: [] },
  documents: { type: [String], default: [] },
  commonIssues: { type: [String], default: [] },
  howWeHelp: { type: [String], default: [] },
  keyConsiderations: { type: [String], default: [] },
  faq: { type: [FaqEntrySchema], default: [] },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
  order: { type: Number, default: 0 },
});

const ServiceContentSchema = new Schema<IServiceContent>({
  slug: { type: String, required: true },
  title: { type: String, default: "" },
  shortDescription: { type: String, default: "" },
  suitableFor: { type: String, default: "" },
  icon: { type: String, default: "FileCheck" },
  image: { type: String, default: "" },
  imageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
  overview: { type: [String], default: [] },
  eligibility: { type: [String], default: [] },
  process: { type: [ProcessStepSchema], default: [] },
  documents: { type: [String], default: [] },
  commonIssues: { type: [String], default: [] },
  howWeHelp: { type: [String], default: [] },
  faq: { type: [FaqEntrySchema], default: [] },
  relatedSlugs: { type: [String], default: [] },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
  order: { type: Number, default: 0 },
  programs: { type: [ProgramContentSchema], default: [] },
});

const ServiceCategoryContentSchema = new Schema<IServiceCategoryContent>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    title: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    intro: { type: [String], default: [] },
    icon: { type: String, default: "FileCheck" },
    image: { type: String, default: "" },
    imageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    order: { type: Number, default: 0 },
    services: { type: [ServiceContentSchema], default: [] },
  },
  { timestamps: true }
);

export default models.ServiceCategoryContent ||
  model<IServiceCategoryContent>("ServiceCategoryContent", ServiceCategoryContentSchema);
