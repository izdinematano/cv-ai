import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/editor`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];
}
