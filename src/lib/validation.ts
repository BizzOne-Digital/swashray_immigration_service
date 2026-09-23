import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const inquirySchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional().default(""),
  serviceOfInterest: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10, "Please provide a few details about your inquiry.").max(4000),
  preferredContactMethod: z.enum(["Email", "Phone", "Either"]).default("Email"),
  // honeypot field — real users never fill this in; bots often do. Left
  // unconstrained here so a filled value doesn't surface as a validation
  // error to the bot — the route handler checks it and silently no-ops.
  companyWebsite: z.string().max(300).optional().default(""),
});

export const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(5, "Please enter a valid phone number.").max(40),
  serviceId: z.string().trim().optional().default(""),
  serviceName: z.string().trim().max(160).optional().default(""),
  country: z.string().trim().max(120).optional().default(""),
  preferredDate: z.string().trim().min(1, "Please choose a preferred date."),
  preferredTime: z.string().trim().min(1, "Please choose a preferred time."),
  preferredContactMethod: z.enum(["Email", "Phone", "Either"]).default("Email"),
  message: z.string().trim().max(4000).optional().default(""),
  agreedToConsultationTerms: z.coerce.boolean().optional().default(false),
  companyWebsite: z.string().max(300).optional().default(""),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).optional(),
  shortDescription: z.string().trim().max(400).optional().default(""),
  description: z.string().trim().max(20000).optional().default(""),
  whoItsFor: z.string().trim().max(4000).optional().default(""),
  process: z.string().trim().max(4000).optional().default(""),
  icon: z.string().trim().max(60).optional().default("FileCheck"),
  ctaText: z.string().trim().max(80).optional().default("Book a Consultation"),
  ctaUrl: z.string().trim().max(300).optional().default("/booking"),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
  featuredImageMediaId: z.string().trim().optional().nullable(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional().default([]),
  seo: z.object({ title: z.string().optional().default(""), description: z.string().optional().default("") }).optional(),
});

export const newsArticleSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200).optional(),
  excerpt: z.string().trim().max(500).optional().default(""),
  content: z.string().trim().max(50000).optional().default(""),
  category: z.string().trim().max(60).optional().default("General Updates"),
  tags: z.array(z.string()).optional().default([]),
  author: z.string().trim().max(120).optional().default("Swashray Immigration Team"),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.coerce.boolean().default(false),
  isDemo: z.coerce.boolean().default(false),
  featuredImageMediaId: z.string().trim().optional().nullable(),
  seo: z.object({ title: z.string().optional().default(""), description: z.string().optional().default("") }).optional(),
});
