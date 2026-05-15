import { useState } from 'react';
import {
  getStoreFaviconDomain,
  getStoreBrandFallbackVariant,
  STORE_FAVICON_BASE,
} from '../utils/storeBrandIcon';
import './StoreBrandMark.css';

function FallbackIcon({ variant, className }) {
  const svgClass = `store-brand-mark__fallback ${className}`.trim();

  if (variant === 'farm') {
    return (
      <svg
        className={svgClass}
        viewBox="0 0 16 16"
        aria-hidden
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M8 1.25c-.35.42-.68.82-1 1.2C5.3 4.4 4 6.52 4 8.75c0 1.55.78 2.85 2.05 3.55l.45.25h3l.45-.25C11.22 11.6 12 10.3 12 8.75c0-2.23-1.3-4.35-3-6.3-.32-.38-.65-.78-1-1.2zm0 2.1c1.35 1.55 2.15 3.05 2.15 4.4 0 .85-.4 1.55-1.05 1.95H6.9c-.65-.4-1.05-1.1-1.05-1.95 0-1.35.8-2.85 2.15-4.4z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={svgClass}
      viewBox="0 0 16 16"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M3.5 13V6.2L8 3.5l4.5 2.7V13h-9zm1.5-.9h6V7.3L8 5.3l-3 2v4.8zm2-2.2h2V8.4H7v1.5z"
      />
    </svg>
  );
}

/**
 * Small brand mark: favicons via DuckDuckGo CDN from mapped domains (e.g. freshfarms.com),
 * with neutral SVG fallback if the image fails or the store has no mapping.
 */
export default function StoreBrandMark({ store, size = 'default', className = '' }) {
  const domain = getStoreFaviconDomain(store);
  const fallbackVariant = getStoreBrandFallbackVariant(store);
  const [broken, setBroken] = useState(false);
  const tiny = size === 'tiny' ? 'store-brand-mark--tiny' : '';
  const extra = [tiny, className].filter(Boolean).join(' ');

  if (!domain || broken) {
    return <FallbackIcon variant={fallbackVariant} className={extra} />;
  }

  return (
    <img
      src={`${STORE_FAVICON_BASE}/${domain}.ico`}
      alt=""
      className={['store-brand-mark', extra].filter(Boolean).join(' ')}
      width={16}
      height={16}
      decoding="async"
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}
