import mongoose, { Schema, models, model } from "mongoose";
import { NEWS_CATEGORIES } from "@/lib/constants";

export { NEWS_CATEGORIES };

export interface INewsArticle {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageMediaId?: mongoose.Types.ObjectId | null;
  category: string;
  tags: string[];
  author: string;
  publishedAt: Date | null;
  status: "draft" | "published";
  featured: boolean;
  isDemo: boolean;
  seo: { title: string; description: string };
  createdAt: Date;
  updatedAt: Date;
}

const NewsArticleSchema = new Schema<INewsArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    featuredImageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    category: { type: String, default: "General Updates" },
    tags: { type: [String], default: [] },
    author: { type: String, default: "Swashray Immigration Team" },
    publishedAt: { type: Date, default: null },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    featured: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default models.NewsArticle || model<INewsArticle>("NewsArticle", NewsArticleSchema);
