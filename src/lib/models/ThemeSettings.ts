import mongoose, { Schema, models, model } from "mongoose";

export interface IThemeSettings {
  _id: mongoose.Types.ObjectId;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  borderRadius: "none" | "small" | "medium" | "large";
  buttonStyle: "solid" | "outline" | "pill";
  headingFont: "serif" | "sans";
  updatedAt: Date;
}

const ThemeSettingsSchema = new Schema<IThemeSettings>(
  {
    colors: {
      primary: { type: String, default: "#0b2545" },
      secondary: { type: String, default: "#13315c" },
      accent: { type: String, default: "#c8a24a" },
      background: { type: String, default: "#fbfaf7" },
      surface: { type: String, default: "#ffffff" },
      text: { type: String, default: "#1c2230" },
      muted: { type: String, default: "#5b6572" },
    },
    borderRadius: { type: String, enum: ["none", "small", "medium", "large"], default: "medium" },
    buttonStyle: { type: String, enum: ["solid", "outline", "pill"], default: "solid" },
    headingFont: { type: String, enum: ["serif", "sans"], default: "serif" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.ThemeSettings || model<IThemeSettings>("ThemeSettings", ThemeSettingsSchema);
