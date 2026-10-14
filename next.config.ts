import type { NextConfig } from "next";
import { LEGACY_SERVICE_REDIRECTS } from "./src/lib/legacyServiceRedirects";

const nextConfig: NextConfig = {
  async redirects() {
    // Temporary (307) rather than permanent, so the destinations can still be
    // changed later without browsers holding on to a cached redirect.
    return Object.entries(LEGACY_SERVICE_REDIRECTS).map(([slug, destination]) => ({
      source: `/services/${slug}`,
      destination,
      permanent: false,
    }));
  },
};

export default nextConfig;
