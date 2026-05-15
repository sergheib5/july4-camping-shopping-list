import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TripCountdown from './TripCountdown';
import { getAllShoppingListItems, getAllMenuItems } from '../firebase/db';
import { exportAllDataToCSV } from '../utils/csvExport';
import { HEADER_HERO_IMAGE_URL } from '../constants/headerHeroImages';
import { CAMP_DIRECTIONS_MAPS_URL } from '../constants/campDirections';
import './Header.css';

const Header = () => {
  const [isExporting, setIsExporting] = useState(false);
  const location = useLocation();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAllDataToCSV(getAllShoppingListItems, getAllMenuItems);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="app-header">
      <div className="app-header__hero" aria-hidden="true">
        <div
          className="app-header__hero-bg"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(11, 18, 32, 0.28) 0%, rgba(11, 18, 32, 0.12) 45%, rgba(11, 18, 32, 0.35) 100%), url(${HEADER_HERO_IMAGE_URL})`,
          }}
        />
        <div className="app-header__hero-scrim" />
      </div>
      <div className="header-content">
        <TripCountdown />
        <div className="header-actions">
          <Link
            className="header-toolbar-button header-toolbar-button--terms"
            to="/terms"
            state={{ from: location.pathname }}
            title="Campground rules — overview & full agreement"
            aria-label="Campground rules: overview and full agreement text"
          >
            Terms
          </Link>
          <a
            className="header-toolbar-button header-toolbar-button--directions"
            href={CAMP_DIRECTIONS_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open camp directions in Google Maps"
            aria-label="Get Direction — opens Google Maps"
          >
            Get Direction
          </a>
          <button
            type="button"
            className="header-toolbar-button header-toolbar-button--export"
            onClick={handleExport}
            disabled={isExporting}
            title="Export all data to CSV"
            aria-label="Export CSV"
          >
            {isExporting ? (
              <span className="header-export-spinner" aria-hidden="true" />
            ) : (
              <svg
                className="header-export-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
