import React from 'react';
import { Link } from 'react-router-dom';
import { CaretRight, House } from '@phosphor-icons/react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const fullItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...items,
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fullItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href
        ? `https://dream-to-achievers.vercel.app${item.href.startsWith('/') ? item.href : `/${item.href}`}`
        : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumbs" className={`flex items-center space-x-1.5 text-xs font-mono text-[#5B5C50] ${className}`}>
        <ol className="flex items-center space-x-1.5 list-none p-0 m-0" itemScope itemType="https://schema.org/BreadcrumbList">
          {fullItems.map((item, idx) => {
            const isLast = idx === fullItems.length - 1;
            return (
              <li
                key={idx}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
                className="flex items-center space-x-1.5"
              >
                <meta itemProp="position" content={String(idx + 1)} />
                {idx > 0 && <CaretRight size={10} className="text-[#7C7D70] shrink-0" aria-hidden="true" />}
                
                {isLast || !item.href ? (
                  <span
                    itemProp="name"
                    aria-current="page"
                    className="text-[#1F4D3E] font-semibold truncate max-w-[200px]"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    itemProp="item"
                    className="hover:text-[#1E241F] transition-colors flex items-center space-x-1 truncate max-w-[160px]"
                  >
                    {idx === 0 && <House size={12} className="shrink-0" />}
                    <span itemProp="name">{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};
