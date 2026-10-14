/**
 * Database-backed replacement for the old static src/lib/servicesData/*.ts
 * content. Mirrors that module's function names/shapes closely so the
 * /services page tree only had to change *where* data comes from, not how
 * it's rendered — every node's `image` field is already resolved to
 * (admin-uploaded override) || (original static path) before it reaches a
 * page, so CategoryCard/ServiceDetailLayout/RelatedServices/FaqAccordion
 * never had to change at all.
 *
 * If the ServiceCategoryContent collection is empty (e.g. a fresh database,
 * or before `npm run migrate:services` has been run), everything falls back
 * to the static src/lib/servicesData content, so the Services pages, the
 * header menu, and the sitemap are never left blank.
 */
import { cache } from "react";
import { connectDB } from "@/lib/db";
import ServiceCategoryContent from "@/lib/models/ServiceCategoryContent";
import { mediaUrl, serialize } from "@/lib/utils";
import { CATEGORIES as STATIC_CATEGORIES, ALL_SERVICES as STATIC_SERVICES } from "@/lib/servicesData";
import type { CategoryEntry, ServiceEntry, ProgramEntry } from "@/lib/servicesData/types";

function resolveCategory(doc: any): CategoryEntry {
  return {
    slug: doc.slug,
    title: doc.title,
    shortDescription: doc.shortDescription,
    intro: doc.intro || [],
    icon: doc.icon,
    image: mediaUrl(doc.imageMediaId) || doc.image,
  };
}

function resolveService(doc: any, categorySlug: string): ServiceEntry {
  return {
    slug: doc.slug,
    categorySlug,
    title: doc.title,
    shortDescription: doc.shortDescription,
    suitableFor: doc.suitableFor,
    icon: doc.icon,
    image: mediaUrl(doc.imageMediaId) || doc.image,
    overview: doc.overview || [],
    eligibility: doc.eligibility || [],
    process: doc.process || [],
    documents: doc.documents || [],
    commonIssues: doc.commonIssues || [],
    howWeHelp: doc.howWeHelp || [],
    faq: doc.faq || [],
    relatedSlugs: doc.relatedSlugs || [],
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    programs: (doc.programs || [])
      .slice()
      .sort((a: any, b: any) => a.order - b.order)
      .map((p: any) => resolveProgram(p)),
  };
}

function resolveProgram(doc: any): ProgramEntry {
  return {
    slug: doc.slug,
    title: doc.title,
    shortDescription: doc.shortDescription,
    suitableFor: doc.suitableFor,
    icon: doc.icon,
    image: mediaUrl(doc.imageMediaId) || doc.image,
    overview: doc.overview || [],
    eligibility: doc.eligibility || [],
    process: doc.process || [],
    documents: doc.documents || [],
    commonIssues: doc.commonIssues || [],
    howWeHelp: doc.howWeHelp || [],
    keyConsiderations: doc.keyConsiderations || [],
    faq: doc.faq || [],
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
  };
}

/** The static content, shaped like ServiceCategoryContent documents. */
function staticCategoryDocs() {
  return STATIC_CATEGORIES.map((category, categoryIndex) => ({
    ...category,
    order: categoryIndex,
    services: STATIC_SERVICES.filter((s) => s.categorySlug === category.slug).map((s, serviceIndex) => ({
      ...s,
      order: serviceIndex,
      programs: (s.programs || []).map((p, programIndex) => ({ ...p, order: programIndex })),
    })),
  }));
}

/**
 * Every category document (with its services and programs embedded), in
 * display order. Memoized per request, so a page that resolves several
 * categories/services/related links only reads the collection once.
 */
const getAllCategoryDocs = cache(async (): Promise<any[]> => {
  await connectDB();
  const docs = await ServiceCategoryContent.find().sort({ order: 1 }).lean();
  if (docs.length === 0) return staticCategoryDocs();
  return serialize(docs) as any[];
});

function sortedServiceDocs(categoryDoc: any): any[] {
  return (categoryDoc.services || []).slice().sort((a: any, b: any) => a.order - b.order);
}

export async function getCategories(): Promise<CategoryEntry[]> {
  const docs = await getAllCategoryDocs();
  return docs.map(resolveCategory);
}

export async function getCategory(slug: string): Promise<CategoryEntry | undefined> {
  const docs = await getAllCategoryDocs();
  const doc = docs.find((d) => d.slug === slug);
  return doc ? resolveCategory(doc) : undefined;
}

export async function getServicesByCategory(categorySlug: string): Promise<ServiceEntry[]> {
  const docs = await getAllCategoryDocs();
  const doc = docs.find((d) => d.slug === categorySlug);
  if (!doc) return [];
  return sortedServiceDocs(doc).map((s) => resolveService(s, categorySlug));
}

/**
 * Every category with its services, in display order — used to build the
 * header mega menu, the footer service links, and the sitemap.
 */
export async function getServicesTree(): Promise<{ category: CategoryEntry; services: ServiceEntry[] }[]> {
  const docs = await getAllCategoryDocs();
  return docs.map((doc) => ({
    category: resolveCategory(doc),
    services: sortedServiceDocs(doc).map((s) => resolveService(s, doc.slug)),
  }));
}

/**
 * Every service as a form option ("Service of Interest" dropdowns), grouped
 * by category title. `_id` is the stable "category/service" path.
 */
export async function getServiceOptions(): Promise<{ _id: string; title: string; group: string }[]> {
  const tree = await getServicesTree();
  return tree.flatMap(({ category, services }) =>
    services.map((s) => ({ _id: `${category.slug}/${s.slug}`, title: s.title, group: category.title }))
  );
}

export async function getService(categorySlug: string, serviceSlug: string): Promise<ServiceEntry | undefined> {
  const services = await getServicesByCategory(categorySlug);
  return services.find((s) => s.slug === serviceSlug);
}

export async function getProgram(
  categorySlug: string,
  serviceSlug: string,
  programSlug: string
): Promise<{ service: ServiceEntry; program: ProgramEntry } | undefined> {
  const service = await getService(categorySlug, serviceSlug);
  const program = service?.programs?.find((p) => p.slug === programSlug);
  if (!service || !program) return undefined;
  return { service, program };
}

export async function resolveRelated(
  relatedSlugs: string[]
): Promise<{ category: CategoryEntry; service: ServiceEntry }[]> {
  const results = await Promise.all(
    relatedSlugs.map(async (combo) => {
      const [categorySlug, serviceSlug] = combo.split("/");
      const category = await getCategory(categorySlug);
      const service = await getService(categorySlug, serviceSlug);
      return category && service ? { category, service } : null;
    })
  );
  return results.filter((v): v is { category: CategoryEntry; service: ServiceEntry } => v !== null);
}

export async function getAllCategoryParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function getAllServiceParams() {
  const docs = await getAllCategoryDocs();
  return docs.flatMap((doc) => (doc.services || []).map((s: any) => ({ category: doc.slug, service: s.slug })));
}

export async function getAllProgramParams() {
  const docs = await getAllCategoryDocs();
  return docs.flatMap((doc) =>
    (doc.services || []).flatMap((s: any) =>
      (s.programs || []).map((p: any) => ({ category: doc.slug, service: s.slug, program: p.slug }))
    )
  );
}
