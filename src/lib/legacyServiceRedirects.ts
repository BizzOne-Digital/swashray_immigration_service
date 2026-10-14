/**
 * The site's original six flat service pages (/services/<slug>, backed by the
 * admin-managed Service collection) were superseded by the in-depth
 * category → service hierarchy. Their old URLs — still linked from older
 * content, bookmarks, and search results — redirect to the closest new page
 * (wired up in next.config.ts). `/services/citizenship` needs no entry: it is
 * now the Citizenship category page itself.
 */
export const LEGACY_SERVICE_REDIRECTS: Record<string, string> = {
  "visitor-visa": "/services/temporary-residence/visitor-visa",
  sponsorship: "/services/family-sponsorship",
  "work-permits": "/services/temporary-residence",
  "study-permits": "/services/temporary-residence/study-permit",
  "passport-services": "/services/other-immigration-services",
};
