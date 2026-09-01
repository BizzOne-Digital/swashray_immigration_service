import mongoose, { Schema, models, model } from "mongoose";

// Lightweight submission-rate tracker for public forms (booking + inquiry).
// TTL index automatically removes entries after 1 hour.
export interface IRateLimit {
  _id: mongoose.Types.ObjectId;
  key: string; // e.g. `inquiry:203.0.113.4`
  createdAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  key: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

export default models.RateLimit || model<IRateLimit>("RateLimit", RateLimitSchema);
