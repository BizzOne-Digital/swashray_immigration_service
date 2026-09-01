import mongoose, { Schema, models, model } from "mongoose";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/constants";

export { INQUIRY_STATUSES };
export type { InquiryStatus };

export interface IInquiry {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  serviceOfInterest: string;
  message: string;
  preferredContactMethod: string;
  status: InquiryStatus;
  read: boolean;
  adminNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    serviceOfInterest: { type: String, default: "" },
    message: { type: String, required: true },
    preferredContactMethod: { type: String, default: "Email" },
    status: { type: String, enum: INQUIRY_STATUSES, default: "New", index: true },
    read: { type: Boolean, default: false },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Inquiry || model<IInquiry>("Inquiry", InquirySchema);
