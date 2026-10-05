/**
 * Database-backed replacement for the old static src/lib/servicesData/*.ts
 * content. Mirrors that module's function names/shapes closely so the
 * /services page tree only had to change *where* data comes from, not how
 * it's rendered — every node's `image` field is already resolved to
 * (admin-uploaded override) || (original static path) before it reaches a
 * page, so CategoryCard/ServiceDetailLayout/RelatedServices/FaqAccordion
 * never had to change at all.
 */
import { connectDB } from "@/lib/db";
import ServiceCategoryContent from "@/lib/models/ServiceCategoryContent";
import { mediaUrl, serialize } from "@/lib/utils";
import type { CategoryEntry, ServiceEntry, ProgramEntry } from "@/lib/servicesData/types";

type LeanCategory = ReturnType<typeof serialize>;

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

async function getAllCategoryDocs() {
  await connectDB();
  const docs = await ServiceCategoryContent.find().sort({ order: 1 }).lean();
  return serialize(docs) as any[];
}

export async function getCategories(): Promise<CategoryEntry[]> {
  const docs = await getAllCategoryDocs();
  return docs.map(resolveCategory);
}

export async function getCategory(slug: string): Promise<CategoryEntry | undefined> {
  await connectDB();
  const doc = await ServiceCategoryContent.findOne({ slug }).lean();
  if (!doc) return undefined;
  return resolveCategory(serialize(doc));
}

export async function getServicesByCategory(categorySlug: string): Promise<ServiceEntry[]> {
  await connectDB();
  const doc = await ServiceCategoryContent.findOne({ slug: categorySlug }).lean();
  if (!doc) return [];
  const serialized = serialize(doc) as any;
  return (serialized.services || [])
    .slice()
    .sort((a: any, b: any) => a.order - b.order)
    .map((s: any) => resolveService(s, categorySlug));
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
  await connectDB();
  const docs = await ServiceCategoryContent.find().lean();
  const serialized = serialize(docs) as any[];
  return serialized.flatMap((doc) => (doc.services || []).map((s: any) => ({ category: doc.slug, service: s.slug })));
}

export async function getAllProgramParams() {
  await connectDB();
  const docs = await ServiceCategoryContent.find().lean();
  const serialized = serialize(docs) as any[];
  return serialized.flatMap((doc) =>
    (doc.services || []).flatMap((s: any) =>
      (s.programs || []).map((p: any) => ({ category: doc.slug, service: s.slug, program: p.slug }))
    )
  );
}
