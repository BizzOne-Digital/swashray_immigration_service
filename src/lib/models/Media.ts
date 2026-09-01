import mongoose, { Schema, models, model } from "mongoose";

export interface IMedia {
  _id: mongoose.Types.ObjectId;
  filename: string;
  mimeType: string;
  size: number;
  gridFsId: mongoose.Types.ObjectId;
  altText?: string;
  width?: number;
  height?: number;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    gridFsId: { type: Schema.Types.ObjectId, required: true },
    altText: { type: String, default: "" },
    width: Number,
    height: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Media || model<IMedia>("Media", MediaSchema);
