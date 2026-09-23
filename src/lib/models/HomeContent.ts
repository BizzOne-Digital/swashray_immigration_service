import mongoose, { Schema, models, model } from "mongoose";

export interface IBenefit {
  title: string;
  text: string;
  icon: string;
}

export interface IJourneyStep {
  title: string;
  text: string;
}

export interface IHomeContent {
  _id: mongoose.Types.ObjectId;
  heroHeadline: string;
  heroSubheading: string;
  heroImageMediaId?: mongoose.Types.ObjectId | null;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  servicesHeading: string;
  servicesIntro: string;
  calculatorHeading: string;
  calculatorIntro: string;
  calculatorCtaText: string;
  bookingHeading: string;
  bookingIntro: string;
  bookingHighlights: string[];
  bookingCtaText: string;
  trustHeading: string;
  whyChooseHeading: string;
  whyChooseIntro: string;
  benefits: IBenefit[];
  journeyHeading: string;
  journeyIntro: string;
  journeySteps: IJourneyStep[];
  newsHeading: string;
  newsIntro: string;
  ctaHeading: string;
  ctaText: string;
  ctaPrimaryText: string;
  ctaPrimaryUrl: string;
  ctaSecondaryText: string;
  ctaSecondaryUrl: string;
  seo: { title: string; description: string };
  updatedAt: Date;
}

const HomeContentSchema = new Schema<IHomeContent>(
  {
    heroHeadline: { type: String, default: "Canadian Immigration Consultancy | Swashray Immigration Services" },
    heroSubheading: {
      type: String,
      default:
        "Professional guidance for your immigration journey. We help individuals and families understand their options for visitor visas, sponsorships, work permits, study permits, passport services, and citizenship.",
    },
    heroImageMediaId: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    primaryCtaText: { type: String, default: "Book a Consultation" },
    primaryCtaUrl: { type: String, default: "/booking" },
    secondaryCtaText: { type: String, default: "Explore Our Services" },
    secondaryCtaUrl: { type: String, default: "/services" },
    servicesHeading: { type: String, default: "How We Can Help" },
    servicesIntro: {
      type: String,
      default: "General guidance across the most common immigration pathways.",
    },
    calculatorHeading: { type: String, default: "Estimate Your Immigration Score" },
    calculatorIntro: {
      type: String,
      default:
        "Get an informational estimate of your Express Entry Comprehensive Ranking System (CRS) score using the official IRCC point tables, then book a consultation to discuss your options in detail.",
    },
    calculatorCtaText: { type: String, default: "Calculate My Score" },
    bookingHeading: { type: String, default: "Book Your Consultation" },
    bookingIntro: {
      type: String,
      default:
        "Speak directly with our RCIC-IRB licensed consultant about your immigration goals. We'll review your situation, explain your options clearly, and outline the next steps.",
    },
    bookingHighlights: {
      type: [String],
      default: [
        "One-on-one consultation with a Regulated Canadian Immigration Consultant",
        "Clear, honest guidance tailored to your circumstances",
        "Choose a date and time that works for you",
      ],
    },
    bookingCtaText: { type: String, default: "Book a Consultation" },
    trustHeading: { type: String, default: "Regulated & Licensed" },
    whyChooseHeading: { type: String, default: "Why Clients Choose Swashray" },
    whyChooseIntro: {
      type: String,
      default: "A clear, organized, and personal approach to a process that can otherwise feel overwhelming.",
    },
    benefits: {
      type: [
        {
          title: String,
          text: String,
          icon: String,
        },
      ],
      default: [
        { title: "Personalized Guidance", text: "We take the time to understand your specific situation and goals.", icon: "UserCheck" },
        { title: "Clear Communication", text: "Straightforward explanations, with no confusing jargon.", icon: "MessageCircle" },
        { title: "Professional Service", text: "An organized, respectful, and confidential process from start to finish.", icon: "ShieldCheck" },
        { title: "Support Throughout the Process", text: "We stay in touch and keep you informed at each stage.", icon: "Handshake" },
      ],
    },
    journeyHeading: { type: String, default: "Your Immigration Journey" },
    journeyIntro: { type: String, default: "A general outline of how we work together." },
    journeySteps: {
      type: [{ title: String, text: String }],
      default: [
        { title: "Initial Inquiry", text: "Tell us about your immigration goals." },
        { title: "Consultation", text: "Discuss your situation and possible options." },
        { title: "Documentation", text: "Prepare the necessary information and documentation." },
        { title: "Application Support", text: "Receive guidance through the relevant process." },
        { title: "Follow-Up", text: "Stay informed about your application." },
      ],
    },
    newsHeading: { type: String, default: "Latest News & Updates" },
    newsIntro: { type: String, default: "General immigration news and updates from our team." },
    ctaHeading: { type: String, default: "Let's Discuss Your Immigration Journey" },
    ctaText: {
      type: String,
      default: "Reach out today to book a consultation or send us your questions — we're here to help you take the next step.",
    },
    ctaPrimaryText: { type: String, default: "Book a Consultation" },
    ctaPrimaryUrl: { type: String, default: "/booking" },
    ctaSecondaryText: { type: String, default: "Send an Inquiry" },
    ctaSecondaryUrl: { type: String, default: "/contact" },
    seo: {
      title: { type: String, default: "Canadian Immigration Consultancy | Swashray Immigration Services" },
      description: {
        type: String,
        default:
          "Professional guidance for your immigration journey. Visitor visas, sponsorships, work permits, study permits, passport services, and citizenship support.",
      },
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.HomeContent || model<IHomeContent>("HomeContent", HomeContentSchema);
