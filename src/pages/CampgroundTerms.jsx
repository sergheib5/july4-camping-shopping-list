import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { foxHillTermsOverviewItems } from '../content/foxHillTermsOverview';
import { foxHillTermsIntro, foxHillTermsSections } from '../content/foxHillTermsSections';
import './CampgroundTerms.css';

function CampgroundTerms() {
  const location = useLocation();

  const back = useMemo(() => {
    const from = location.state?.from;
    if (from === '/menu') {
      return { to: '/menu', label: '← Back to meals' };
    }
    return { to: '/', label: '← Back to shopping list' };
  }, [location.state]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Campground rules — Fox Hill | July 4 campout';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="terms-page">
      <header className="terms-page__top">
        <div className="terms-page__toolbar">
          <Link to={back.to} className="terms-page__back">
            {back.label}
          </Link>
        </div>
        <div className="terms-page__heading">
          <p className="terms-page__property">Fox Hill RV Resort</p>
          <h1 className="terms-page__page-title">Campground rules</h1>
        </div>
      </header>

      <main className="terms-page__main">
        <section
          className="terms-overview"
          aria-labelledby="terms-overview-heading"
        >
          <div className="terms-overview__header">
            <span className="terms-overview__sparkle" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l1.09 4.26L17 7.5l-3.91 1.24L12 13l-1.09-4.26L7 7.5l3.91-1.24L12 2z"
                  fill="url(#terms-overview-star-gradient)"
                />
                <path
                  d="M18 14l.66 2.57 2.34.74-2.34.74L18 20l-.66-2.57-2.34-.74 2.34-.74L18 14z"
                  fill="url(#terms-overview-star-gradient)"
                  opacity="0.85"
                />
                <path
                  d="M5 15l.55 2.12 2 .63-2 .63L5 20l-.55-2.12-2-.63 2-.63L5 15z"
                  fill="url(#terms-overview-star-gradient)"
                  opacity="0.7"
                />
                <defs>
                  <linearGradient id="terms-overview-star-gradient" x1="4" y1="2" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1a73e8" />
                    <stop offset="1" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <h2 id="terms-overview-heading" className="terms-overview__title">
              Overview
            </h2>
          </div>
          <p className="terms-overview__lede">
            Key points from the guest agreement — read the full document below for exact wording.
          </p>
          <ul className="terms-overview__list">
            {foxHillTermsOverviewItems.map((item, i) => (
              <li key={`overview-${i}`}>
                {item.parts.map((part, j) =>
                  typeof part === 'string' ? (
                    <span key={`${i}-${j}`}>{part}</span>
                  ) : (
                    <strong key={`${i}-${j}`}>{part.strong}</strong>
                  ),
                )}
              </li>
            ))}
          </ul>
        </section>

        <article className="terms-article">
          <h2 className="terms-article__title">{foxHillTermsIntro.title}</h2>
          <p className="terms-article__subtitle">{foxHillTermsIntro.subtitle}</p>

          <p>{foxHillTermsIntro.lead}</p>
          <p>{foxHillTermsIntro.acknowledges}</p>
          <p>{foxHillTermsIntro.updates}</p>

          <hr className="terms-article__rule" />

          {foxHillTermsSections.map((section) => (
            <section key={section.id} id={section.id} className="terms-section">
              <h3 className="terms-section__title">{section.title}</h3>

              {section.paragraphs?.map((text, i) => (
                <p key={`${section.id}-p-${i}`}>{text}</p>
              ))}

              {section.sub
                ? (Array.isArray(section.sub) ? section.sub : [section.sub]).map((line, i) => (
                    <p key={`${section.id}-s-${i}`} className="terms-section__sub">
                      {line}
                    </p>
                  ))
                : null}

              {section.bullets ? (
                <ul className="terms-section__list">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              {section.foot?.map((text, i) => (
                <p key={`${section.id}-f-${i}`} className="terms-section__foot">
                  {text}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>

      <BottomNav />
    </div>
  );
}

export default CampgroundTerms;
