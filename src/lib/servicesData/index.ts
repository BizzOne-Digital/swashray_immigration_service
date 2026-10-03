import type { CategoryEntry, ServiceEntry, ProgramEntry } from "./types";
import { CATEGORIES, getCategory } from "./categories";
import { TEMPORARY_RESIDENCE_SERVICES } from "./temporaryResidence";
import { PERMANENT_RESIDENCE_SERVICES } from "./permanentResidence";
import { FAMILY_SPONSORSHIP_SERVICES } from "./familySponsorship";
import { CITIZENSHIP_SERVICES } from "./citizenship";
import { IRB_REPRESENTATION_SERVICES } from "./irbRepresentation";
import { OTHER_SERVICES } from "./otherServices";

export type { CategoryEntry, ServiceEntry, ProgramEntry, DetailContent, ProcessStep, FaqEntry } from "./types";
export { CATEGORIES, getCategory };

/** Every service across every category, in declaration order. */
export const ALL_SERVICES: ServiceEntry[] = [
  ...TEMPORARY_RESIDENCE_SERVICES,
  ...PERMANENT_RESIDENCE_SERVICES,
  ...FAMILY_SPONSORSHIP_SERVICES,
  ...CITIZENSHIP_SERVICES,
  ...IRB_REPRESENTATION_SERVICES,
  ...OTHER_SERVICES,
];

export function getServicesByCategory(categorySlug: string): ServiceEntry[] {
  return ALL_SERVICES.filter((s) => s.categorySlug === categorySlug);
}

export function getService(categorySlug: string, serviceSlug: string): ServiceEntry | undefined {
  return ALL_SERVICES.find((s) => s.categorySlug === categorySlug && s.slug === serviceSlug);
}

export function getProgram(
  categorySlug: string,
  serviceSlug: string,
  programSlug: string
): { service: ServiceEntry; program: ProgramEntry } | undefined {
  const service = getService(categorySlug, serviceSlug);
  const program = service?.programs?.find((p) => p.slug === programSlug);
  if (!service || !program) return undefined;
  return { service, program };
}

/** Resolves "category/service" strings used in relatedSlugs into renderable cards. */
export function resolveRelated(relatedSlugs: string[]): { category: CategoryEntry; service: ServiceEntry }[] {
  return relatedSlugs
    .map((combo) => {
      const [categorySlug, serviceSlug] = combo.split("/");
      const category = getCategory(categorySlug);
      const service = getService(categorySlug, serviceSlug);
      return category && service ? { category, service } : null;
    })
    .filter((v): v is { category: CategoryEntry; service: ServiceEntry } => v !== null);
}

export function getAllCategoryParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export function getAllServiceParams() {
  return ALL_SERVICES.map((s) => ({ category: s.categorySlug, service: s.slug }));
}

export function getAllProgramParams() {
  return ALL_SERVICES.flatMap((s) =>
    (s.programs ?? []).map((p) => ({ category: s.categorySlug, service: s.slug, program: p.slug }))
  );
}
