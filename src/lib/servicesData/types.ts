/**
 * Static content model for the in-depth Services hierarchy:
 *
 *   /services                                   -> CategoryEntry[]
 *   /services/[category]                        -> CategoryEntry + its ServiceSummary[]
 *   /services/[category]/[service]               -> ServiceEntry
 *   /services/[category]/[service]/[program]      -> ProgramEntry (only where a service
 *                                                     genuinely has distinct pathways)
 *
 * This is intentionally plain TypeScript data (not database-backed): it's
 * reference/structural content that the practice writes and reviews like
 * copy, not per-client records. The existing Mongoose `Service` model, its
 * admin CRUD screens, and the flat `/services/[category]` legacy fallback
 * for old service slugs are untouched — this is an additive layer.
 */

export interface ProcessStep {
  title: string;
  text: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** Shared by both a full service page and a program (sub-pathway) page. */
export interface DetailContent {
  slug: string;
  title: string;
  /** One line used on cards and in <meta description> fallbacks. */
  shortDescription: string;
  /** Who this page is generally written for — used in listings and the hero. */
  suitableFor: string;
  icon: string;
  /** Path under /public used as the card/hero background image. */
  image: string;
  /** 2-4 short paragraphs. */
  overview: string[];
  eligibility: string[];
  process: ProcessStep[];
  documents: string[];
  commonIssues: string[];
  howWeHelp: string[];
  faq: FaqEntry[];
  seoTitle: string;
  seoDescription: string;
}

export interface ProgramEntry extends DetailContent {
  /** Extra line shown on the parent service's program card. */
  keyConsiderations: string[];
}

export interface ServiceEntry extends DetailContent {
  categorySlug: string;
  /** Present only when this service genuinely has distinct pathways/streams. */
  programs?: ProgramEntry[];
  /** "category/service" pairs, rendered as Related Services cards. */
  relatedSlugs: string[];
}

export interface CategoryEntry {
  slug: string;
  title: string;
  shortDescription: string;
  intro: string[];
  icon: string;
  /** Path under /public used as the card background image. */
  image: string;
}
