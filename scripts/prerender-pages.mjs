import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://dream-to-achievers.vercel.app';
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BASE_HTML_FILE = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(BASE_HTML_FILE)) {
  console.error('[ERROR] dist/index.html not found. Run "vite build" first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(BASE_HTML_FILE, 'utf8');

const PAGES = [
  {
    path: '/',
    title: 'Dream to Achievers | B2B Wholesale Platform Founded by Faria Imran',
    description: 'Official platform of Dream to Achievers, founded by Faria Imran. Source verified wholesale inventory in Pakistan, sell nationwide with COD, and earn structured cash milestone rewards.',
    canonical: `${DOMAIN}/`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'Dream to Achievers — Modern B2B Wholesale Commerce & Partner Growth Platform',
    contentSummary: 'Pakistan\'s verified digital wholesale ecosystem. Source high-demand inventory at direct trade rates, distribute nationwide with automated Cash on Delivery across 150+ cities, and earn guaranteed unit profit margins.',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${DOMAIN}/#website`,
          url: `${DOMAIN}/`,
          name: 'Dream to Achievers',
          alternateName: ['DreamToAchievers', 'Dream to Achievers Official', 'Dream to Achievers B2B'],
          description: 'Verified B2B wholesale product distribution and reseller growth network in Pakistan.',
          inLanguage: 'en-US'
        },
        {
          '@type': 'Organization',
          '@id': `${DOMAIN}/#organization`,
          name: 'Dream to Achievers',
          alternateName: 'DreamToAchievers',
          url: `${DOMAIN}/`,
          logo: {
            '@type': 'ImageObject',
            '@id': `${DOMAIN}/#logo`,
            url: `${DOMAIN}/images/brand-logo.png`,
            contentUrl: `${DOMAIN}/images/brand-logo.png`,
            caption: 'Dream to Achievers Official Brand Logo',
            width: '1024',
            height: '1024'
          },
          image: `${DOMAIN}/images/brand-logo.png`,
          description: 'Official verified B2B wholesale commerce, product distribution, and reseller network platform founded by Faria Imran.',
          founder: {
            '@type': 'Person',
            name: 'Faria Imran',
            jobTitle: 'Founder & Executive Director',
            url: `${DOMAIN}/founder/faria-imran`
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'dreamtoachievers@gmail.com',
            telephone: '+92 305 4511395',
            availableLanguage: ['en', 'ur']
          },
          sameAs: [
            'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N',
            'https://www.tiktok.com/@dream.to.achievers',
            'https://linkedin.com/company/dream-to-achievers',
            'https://youtube.com/@dreamtoachievers',
            'https://x.com/dreamtoachiever',
            'https://instagram.com/dreamtoachievers',
            'https://facebook.com/dreamtoachievers'
          ]
        },
        {
          '@type': 'Person',
          '@id': `${DOMAIN}/founder/faria-imran#person`,
          name: 'Faria Imran',
          jobTitle: 'Founder & Executive Director',
          worksFor: {
            '@id': `${DOMAIN}/#organization`
          },
          url: `${DOMAIN}/founder/faria-imran`
        }
      ]
    }
  },
  {
    path: '/about',
    title: 'About Dream to Achievers — B2B Wholesale Platform Founded by Faria Imran',
    description: 'Learn about Dream to Achievers, Pakistan\'s verified B2B wholesale commerce platform founded by Faria Imran. Discover our mission, nationwide COD logistics, and partner growth ecosystem.',
    canonical: `${DOMAIN}/about`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'About Dream to Achievers — Modern B2B Wholesale Platform',
    contentSummary: 'Empowering independent resellers and digital entrepreneurs across Pakistan through direct wholesale sourcing, automated courier Cash on Delivery (COD), and transparent unit profit margins.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Dream to Achievers',
      url: `${DOMAIN}/about`,
      description: 'Official background and operational overview of Dream to Achievers and founder Faria Imran.',
      mainEntity: {
        '@type': 'Organization',
        name: 'Dream to Achievers',
        founder: {
          '@type': 'Person',
          name: 'Faria Imran',
          jobTitle: 'Founder & Executive Director',
          url: `${DOMAIN}/founder/faria-imran`
        }
      }
    }
  },
  {
    path: '/founder/faria-imran',
    title: 'Faria Imran — Founder of Dream to Achievers | Leadership Profile',
    description: 'Official profile of Faria Imran, Founder & Executive Director of Dream to Achievers. Learn about her mission building Pakistan\'s verified B2B wholesale platform.',
    canonical: `${DOMAIN}/founder/faria-imran`,
    ogType: 'profile',
    ogImage: `${DOMAIN}/images/faria-imran.webp`,
    h1: 'Faria Imran — Founder of Dream to Achievers',
    contentSummary: 'Executive profile of Faria Imran, Founder & Executive Director of Dream to Achievers. Establishing accessible wholesale distribution infrastructure and courier COD across 150+ Pakistani cities.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${DOMAIN}/founder/faria-imran#person`,
      name: 'Faria Imran',
      jobTitle: 'Founder & Executive Director',
      worksFor: {
        '@type': 'Organization',
        name: 'Dream to Achievers',
        url: `${DOMAIN}/`
      },
      url: `${DOMAIN}/founder/faria-imran`,
      image: `${DOMAIN}/images/faria-imran.webp`,
      description: 'Faria Imran is the Founder & Executive Director of Dream to Achievers, an online wholesale distribution platform in Pakistan.'
    }
  },
  {
    path: '/how-it-works',
    title: 'How It Works — B2B Wholesale Reselling Process | Dream to Achievers',
    description: 'Learn how to start an online reselling business with Dream to Achievers in 4 steps. Source verified products, sell nationwide via COD, and withdraw guaranteed profits.',
    canonical: `${DOMAIN}/how-it-works`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'How Dream to Achievers Works — 4 Simple Steps to Profit',
    contentSummary: 'Join for free, choose high-demand wholesale inventory, take customer orders, and let our centralized logistics deliver nationwide with Cash on Delivery while crediting profits to your wallet.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Sell Wholesale Products with Dream to Achievers',
      description: 'A 4-step process for starting an online reselling business in Pakistan with zero upfront inventory investment.'
    }
  },
  {
    path: '/products',
    title: 'Wholesale Products Catalog | Dream to Achievers',
    description: 'Browse verified wholesale products at direct trade rates with transparent unit margins (+PKR 500–1,300) and nationwide COD fulfillment on Dream to Achievers.',
    canonical: `${DOMAIN}/products`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'Wholesale Products Catalog — Verified Distribution Inventory',
    contentSummary: 'Explore verified high-demand product inventory with transparent unit economics. Purchase at wholesale cost and earn direct gross profit margins on every unit distributed.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Wholesale Products Catalog',
      url: `${DOMAIN}/products`
    }
  },
  {
    path: '/products/libas-e-yousaf',
    title: 'Libas-e-Yousaf | Wholesale Price & Margin | Dream to Achievers',
    description: 'Premium executive festive wear & gift set with luxury packaging. Wholesale cost: PKR 2,999, Retail: PKR 4,500, Unit Margin: +PKR 1,501. Fast COD across Pakistan.',
    canonical: `${DOMAIN}/products/libas-e-yousaf`,
    ogType: 'product',
    ogImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    h1: 'Libas-e-Yousaf — Executive Festive Wear & Gift Set',
    contentSummary: 'Wholesale rate: PKR 2,999. Suggested Retail: PKR 4,500. Partner Gross Margin: +PKR 1,501 per unit. Nationwide Cash on Delivery supported.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Libas-e-Yousaf',
      sku: 'DTA-5328',
      offers: {
        '@type': 'Offer',
        price: '4500',
        priceCurrency: 'PKR',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  {
    path: '/products/max-1150',
    title: 'Max 1150 | Wholesale Price & Margin | Dream to Achievers',
    description: 'Ultra HD fitness smartwatch with Bluetooth calling and biometric tracking. Wholesale cost: PKR 3,200, Retail: PKR 3,800, Unit Margin: +PKR 600. Nationwide COD dispatch.',
    canonical: `${DOMAIN}/products/max-1150`,
    ogType: 'product',
    ogImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    h1: 'Max 1150 — Ultra HD Fitness Smartwatch',
    contentSummary: 'Wholesale rate: PKR 3,200. Suggested Retail: PKR 3,800. Partner Gross Margin: +PKR 600 per unit. Nationwide Cash on Delivery supported.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Max 1150',
      sku: 'DTA-6004',
      offers: {
        '@type': 'Offer',
        price: '3800',
        priceCurrency: 'PKR',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  {
    path: '/products/crown-c500',
    title: 'Crown C500 | Wholesale Price & Margin | Dream to Achievers',
    description: 'Executive crown series smartwatch with high-fidelity speaker & dual straps. Wholesale cost: PKR 3,200, Retail: PKR 3,800, Unit Margin: +PKR 600. Nationwide COD.',
    canonical: `${DOMAIN}/products/crown-c500`,
    ogType: 'product',
    ogImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    h1: 'Crown C500 — Executive Smartwatch',
    contentSummary: 'Wholesale rate: PKR 3,200. Suggested Retail: PKR 3,800. Partner Gross Margin: +PKR 600 per unit. Nationwide Cash on Delivery supported.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Crown C500',
      sku: 'DTA-7315',
      offers: {
        '@type': 'Offer',
        price: '3800',
        priceCurrency: 'PKR',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  {
    path: '/products/luxury-watch',
    title: 'Luxury Watch | Wholesale Price & Margin | Dream to Achievers',
    description: 'Sleek luxury timepiece smartwatch with metallic alloy strap and AMOLED display. Wholesale cost: PKR 2,800, Retail: PKR 3,500, Unit Margin: +PKR 700. Nationwide COD.',
    canonical: `${DOMAIN}/products/luxury-watch`,
    ogType: 'product',
    ogImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    h1: 'Luxury Watch — AMOLED Smartwatch Timepiece',
    contentSummary: 'Wholesale rate: PKR 2,800. Suggested Retail: PKR 3,500. Partner Gross Margin: +PKR 700 per unit. Nationwide Cash on Delivery supported.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Luxury Watch',
      sku: 'DTA-3948',
      offers: {
        '@type': 'Offer',
        price: '3500',
        priceCurrency: 'PKR',
        availability: 'https://schema.org/InStock'
      }
    }
  },
  {
    path: '/ranks',
    title: 'Partner Milestone Rewards & Cash Bonus Ranks | Dream to Achievers',
    description: 'Unlock transparent cash milestone bonuses from PKR 2,000 up to PKR 10,000 on Dream to Achievers. Clear sales and referral team qualification criteria.',
    canonical: `${DOMAIN}/ranks`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'Partner Milestone Rewards & Cash Bonus Roadmap',
    contentSummary: 'Level 01 (+PKR 2,000), Level 02 (+PKR 4,000), Level 03 (+PKR 6,000), and Level 04 (+PKR 10,000). Direct dashboard cash payouts upon verified sales and active partner qualification.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Partner Milestone Rewards',
      url: `${DOMAIN}/ranks`
    }
  },
  {
    path: '/services',
    title: 'B2B Distribution & Growth Services | Dream to Achievers',
    description: 'Explore B2B distribution, wholesale logistics, and partner growth enablement services from Dream to Achievers. Helping resellers scale across Pakistan.',
    canonical: `${DOMAIN}/services`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'B2B Distribution & Partner Enablement Services',
    contentSummary: 'Nationwide logistics & COD dispatch across 150+ cities, TikTok viral video pipelines, commercial copy scripting, and wholesale supplier verification ledgers.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'B2B Wholesale Distribution Services',
      provider: {
        '@type': 'Organization',
        name: 'Dream to Achievers'
      }
    }
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions (FAQ) | Dream to Achievers',
    description: 'Find answers to common questions about Dream to Achievers wholesale pricing, Cash on Delivery (COD) dispatch, milestone cash bonuses, and partner onboarding.',
    canonical: `${DOMAIN}/faq`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'Frequently Asked Questions (FAQ) — Dream to Achievers',
    contentSummary: 'Comprehensive answers to inquiries on registration, unit margins, courier COD delivery across Pakistan, milestone rewards, and wallet payouts.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      name: 'Dream to Achievers Frequently Asked Questions',
      url: `${DOMAIN}/faq`
    }
  },
  {
    path: '/contact',
    title: 'Contact Official Support & Founder Desk | Dream to Achievers',
    description: 'Connect with Dream to Achievers support, partner onboarding, and executive desks. Inquire about wholesale catalog access, COD dispatch, and milestone rewards.',
    canonical: `${DOMAIN}/contact`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'Contact Dream to Achievers Support & Onboarding Desks',
    contentSummary: 'Official contact desks for partner onboarding, wholesale procurement, and technical support. WhatsApp desk: +92 305 4511395, Email: dreamtoachievers@gmail.com.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Dream to Achievers',
      url: `${DOMAIN}/contact`
    }
  },
  {
    path: '/terms',
    title: 'Terms & Conditions of Partner Association | Dream to Achievers',
    description: 'Official commercial terms, reseller association conditions, product margin verification, and anti-abuse policies for Dream to Achievers.',
    canonical: `${DOMAIN}/terms`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'Terms & Conditions of Partner Association',
    contentSummary: 'Platform governance, independent partner association rules, margin realization standards, and dispute resolution procedures.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Terms & Conditions',
      url: `${DOMAIN}/terms`
    }
  },
  {
    path: '/privacy',
    title: 'Privacy Policy & Data Security | Dream to Achievers',
    description: 'Read the official Privacy Policy of Dream to Achievers. Understand how partner information, orders, and transaction ledgers are protected.',
    canonical: `${DOMAIN}/privacy`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'Privacy Policy & Data Security',
    contentSummary: 'Data protection standards, partner information confidentiality, encrypted session management, and transaction ledger security.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Privacy Policy',
      url: `${DOMAIN}/privacy`
    }
  },
  {
    path: '/disclaimer',
    title: 'Statutory Earnings Disclaimer | Dream to Achievers',
    description: 'Official earnings and performance disclaimer for Dream to Achievers. Individual results vary based on customer sales volume and marketing diligence.',
    canonical: `${DOMAIN}/disclaimer`,
    ogType: 'website',
    ogImage: `${DOMAIN}/images/brand-logo.png`,
    h1: 'Statutory Earnings & Performance Disclaimer',
    contentSummary: 'Commercial disclosures regarding gross margin calculations (+PKR 500/unit), milestone rewards, and the absence of fixed remuneration guarantees.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Earnings Disclaimer',
      url: `${DOMAIN}/disclaimer`
    }
  }
];

console.log('=== GENERATING STATIC PRE-RENDERED PAGES FOR PRODUCTION ===\n');

for (const page of PAGES) {
  let html = baseHtml;

  // 1. Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`);

  // 2. Replace description meta
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${page.description}" />`
  );

  // 3. Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*id="canonical-url"\s*\/?>/,
    `<link rel="canonical" href="${page.canonical}" id="canonical-url" />`
  );

  // 4. Replace og:title, og:description, og:url, og:type, og:image
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${page.title.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${page.description.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${page.canonical}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${page.ogType}" />`
  );
  if (page.ogImage) {
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${page.ogImage}" />`
    );
  }

  // 5. Replace twitter card tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${page.title.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${page.description.replace(/"/g, '&quot;')}" />`
  );

  // 6. Injected page-specific JSON-LD Schema
  if (page.schema) {
    const schemaTag = `\n    <!-- Page Specific Schema.org Structured Data -->\n    <script type="application/ld+json">\n${JSON.stringify(page.schema, null, 2)}\n    </script>\n  </head>`;
    html = html.replace('</head>', schemaTag);
  }

  // 7. Crawlable semantic fallback inside <div id="root">
  const fallbackHtml = `
    <div id="root">
      <header style="padding: 20px; border-bottom: 1px solid #e3dcc8; background: #faf7ef; font-family: sans-serif;">
        <nav aria-label="Main Navigation">
          <a href="/" style="font-weight: bold; margin-right: 15px; color: #1e241f; text-decoration: none;">Dream to Achievers</a>
          <a href="/products" style="margin-right: 15px; color: #5b5c50; text-decoration: none;">Products</a>
          <a href="/how-it-works" style="margin-right: 15px; color: #5b5c50; text-decoration: none;">How It Works</a>
          <a href="/ranks" style="margin-right: 15px; color: #5b5c50; text-decoration: none;">Ranks</a>
          <a href="/services" style="margin-right: 15px; color: #5b5c50; text-decoration: none;">Services</a>
          <a href="/about" style="margin-right: 15px; color: #5b5c50; text-decoration: none;">About</a>
          <a href="/founder/faria-imran" style="margin-right: 15px; color: #1f4d3e; text-decoration: none;">Founder Faria Imran</a>
          <a href="/faq" style="margin-right: 15px; color: #5b5c50; text-decoration: none;">FAQ</a>
          <a href="/contact" style="color: #5b5c50; text-decoration: none;">Contact</a>
        </nav>
      </header>
      <main style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: sans-serif;">
        <h1 style="font-size: 28px; color: #1e241f;">${page.h1}</h1>
        <p style="font-size: 16px; color: #5b5c50; line-height: 1.6;">${page.contentSummary}</p>
        <p style="font-size: 14px; color: #7c7d70; margin-top: 20px;">
          Official Website: <a href="https://dream-to-achievers.vercel.app/" style="color: #1f4d3e;">https://dream-to-achievers.vercel.app</a> • Founded by Faria Imran
        </p>
      </main>
    </div>`;

  html = html.replace('<div id="root"></div>', fallbackHtml.trim());

  // Determine output location
  let targetFile;
  if (page.path === '/') {
    targetFile = path.join(DIST_DIR, 'index.html');
  } else {
    const targetDir = path.join(DIST_DIR, page.path.replace(/^\//, ''));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    targetFile = path.join(targetDir, 'index.html');
  }

  fs.writeFileSync(targetFile, html, 'utf8');
  console.log(` [PRERENDERED] ${page.path} -> ${path.relative(process.cwd(), targetFile)}`);
}

console.log('\n=== COMPLETED PRERENDERING ALL 16 CANONICAL ROUTES ===');
