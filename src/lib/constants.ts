// Shared enum-like constants used by both Mongoose models (server) and
// client components (forms/filters). Kept dependency-free (no mongoose
// import) so client components can safely import from here.

export const NEWS_CATEGORIES = [
  "Immigration News",
  "Visa Updates",
  "Policy Updates",
  "Important Notices",
  "Study & Work",
  "Citizenship",
  "General Updates",
] as const;

export const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Reschedule Requested",
  "Completed",
  "Cancelled",
  "Declined",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const INQUIRY_STATUSES = ["New", "Contacted", "In Progress", "Resolved", "Archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
