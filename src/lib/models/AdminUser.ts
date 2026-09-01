import mongoose, { Schema, models, model } from "mongoose";

export interface IAdminUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, default: "Admin" },
  },
  { timestamps: true }
);

export default models.AdminUser || model<IAdminUser>("AdminUser", AdminUserSchema);
