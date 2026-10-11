import { useEffect, type FC } from 'react';

export const SITE_URL = 'https://pinguru.me';
export const SITE_NAME = 'PinGuru';

export interface SEOProps {
  title: string;
  description: string;
  /** Path such as "/privacy"; used for canonical and og:url. */
  path: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Sets the document title and social/SEO head tags for the current page. */
export const SEO: FC<SEOProps> = ({ title, description, path, type = 'website', noindex = false }) => {
  useEffect(() => {
    const url = `${SITE_URL}${path === '/' ? '/' : path}`;
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow,noarchive');
    upsertCanonical(url);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', type);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
  }, [title, description, path, type, noindex]);
  return null;
};

export default SEO;
