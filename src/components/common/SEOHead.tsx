import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'profile' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DOMAIN = 'https://dream-to-achievers.vercel.app';
const DEFAULT_OG_IMAGE = `${DOMAIN}/images/brand-logo.png`;
const DEFAULT_OG_IMAGE_ALT = 'Dream to Achievers — Verified B2B Wholesale Commerce & Partner Growth Network';

function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalUrl(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLd(data?: Record<string, any> | Array<Record<string, any>>) {
  const SCRIPT_ID = 'dta-dynamic-schema';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!data) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  const jsonContent = Array.isArray(data)
    ? {
        '@context': 'https://schema.org',
        '@graph': data,
      }
    : data['@context']
    ? data
    : {
        '@context': 'https://schema.org',
        ...data,
      };

  script.textContent = JSON.stringify(jsonContent, null, 2);
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  noindex = false,
  structuredData,
}) => {
  useEffect(() => {
    // 1. Title
    const formattedTitle = title.includes('Dream to Achievers')
      ? title
      : `${title} | Dream to Achievers`;
    document.title = formattedTitle;

    // 2. Meta Description
    setMetaTag('description', description);

    // 3. Canonical URL (Strictly uses official domain)
    const cleanPath = canonicalPath.startsWith('/')
      ? canonicalPath
      : canonicalPath
      ? `/${canonicalPath}`
      : '';
    const canonicalUrl = cleanPath === '' || cleanPath === '/'
      ? `${DOMAIN}/`
      : `${DOMAIN}${cleanPath.replace(/\/$/, '')}`;
    setCanonicalUrl(canonicalUrl);

    // 4. Robots Directives
    if (noindex) {
      setMetaTag('robots', 'noindex, nofollow');
      setMetaTag('googlebot', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      setMetaTag('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // 5. Open Graph tags
    setMetaTag('og:site_name', 'Dream to Achievers', true);
    setMetaTag('og:locale', 'en_US', true);
    setMetaTag('og:title', formattedTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:image:secure_url', ogImage, true);
    setMetaTag('og:image:alt', ogImageAlt, true);

    // 6. Twitter / X Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', '@dreamtoachievers');
    setMetaTag('twitter:title', formattedTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);
    setMetaTag('twitter:image:alt', ogImageAlt);

    // 7. Structured Data (JSON-LD)
    setJsonLd(structuredData);
  }, [title, description, canonicalPath, ogType, ogImage, ogImageAlt, noindex, structuredData]);

  return null;
};
