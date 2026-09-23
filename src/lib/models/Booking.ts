import mongoose, { Schema, models, model } from "mongoose";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/constants";

export { BOOKING_STATUSES };
export type { BookingStatus };

export interface IBooking {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  serviceId?: mongoose.Types.ObjectId | null;
  serviceName: string;
  country: string;
  preferredDate: string;
  preferredTime: string;
  preferredContactMethod: string;
  message: string;
  status: BookingStatus;
  adminNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", default: null },
    serviceName: { type: String, default: "" },
    country: { type: String, default: "" },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    preferredContactMethod: { type: String, default: "Email" },
    message: { type: String, default: "" },
    status: { type: String, enum: BOOKING_STATUSES, default: "Pending", index: true },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

BookingSchema.index({ preferredDate: 1, preferredTime: 1 });

export default models.Booking || model<IBooking>("Booking", BookingSchema);
