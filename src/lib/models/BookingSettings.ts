import mongoose, { Schema, models, model } from "mongoose";

export interface IBookingSettings {
  _id: mongoose.Types.ObjectId;
  workingDays: number[]; // 0 = Sunday ... 6 = Saturday
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  appointmentDurationMinutes: number;
  bufferMinutes: number;
  closedDates: string[]; // "YYYY-MM-DD"
  updatedAt: Date;
}

const BookingSettingsSchema = new Schema<IBookingSettings>(
  {
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "17:00" },
    appointmentDurationMinutes: { type: Number, default: 30 },
    bufferMinutes: { type: Number, default: 0 },
    closedDates: { type: [String], default: [] },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.BookingSettings || model<IBookingSettings>("BookingSettings", BookingSettingsSchema);
