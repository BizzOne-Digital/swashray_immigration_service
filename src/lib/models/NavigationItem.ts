import mongoose, { Schema, models, model } from "mongoose";

export interface INavigationItem {
  _id: mongoose.Types.ObjectId;
  label: string;
  url: string;
  order: number;
  visible: boolean;
  openInNewTab: boolean;
}

const NavigationItemSchema = new Schema<INavigationItem>({
  label: { type: String, required: true },
  url: { type: String, required: true },
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  openInNewTab: { type: Boolean, default: false },
});

export default models.NavigationItem || model<INavigationItem>("NavigationItem", NavigationItemSchema);
