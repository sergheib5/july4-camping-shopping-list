import { Link, useLocation } from 'react-router-dom';
import TripCountdown from './TripCountdown';
import { HEADER_HERO_IMAGE_URL } from '../constants/headerHeroImages';
import { CAMP_DIRECTIONS_MAPS_URL } from '../constants/campDirections';
import './Header.css';

const Header = () => {
  const location = useLocation();

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
          <Link
            className="header-toolbar-button header-toolbar-button--terms"
            to="/terms"
            state={{ from: location.pathname }}
            title="Campground rules — overview & full agreement"
            aria-label="Campground rules: overview and full agreement text"
          >
            Terms
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
