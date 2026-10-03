import mongoose, { Schema, models, model } from "mongoose";

export interface IThemeSettings {
  _id: mongoose.Types.ObjectId;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
    dark: string;
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
      // Premium immigration-consultancy palette: deep charcoal black (trust/
      // authority, elegant), a near-black "dark" tone for premium/footer
      // contrast, gold (prestige, used sparingly), and a strategic red
      // highlight (urgency/CTA accents, used sparingly). See ThemeVars.tsx
      // for how these become CSS vars.
      primary: { type: String, default: "#1A1A1D" },
      secondary: { type: String, default: "#0E0E10" },
      accent: { type: String, default: "#D4AF37" },
      highlight: { type: String, default: "#B5121B" },
      dark: { type: String, default: "#111111" },
      background: { type: String, default: "#F7F8FA" },
      surface: { type: String, default: "#ffffff" },
      text: { type: String, default: "#111111" },
      muted: { type: String, default: "#5B6472" },
    },
    borderRadius: { type: String, enum: ["none", "small", "medium", "large"], default: "medium" },
    buttonStyle: { type: String, enum: ["solid", "outline", "pill"], default: "solid" },
    headingFont: { type: String, enum: ["serif", "sans"], default: "serif" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.ThemeSettings || model<IThemeSettings>("ThemeSettings", ThemeSettingsSchema);
