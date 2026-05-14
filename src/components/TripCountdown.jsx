import { useTripCountdown } from '../hooks/useTripCountdown';
import './TripCountdown.css';

const TripCountdown = () => {
  const { phase, display, nightCaption } = useTripCountdown();
  const { days, hours, minutes, seconds } = display;

  if (phase === 'after') {
    return (
      <div className="countdown-container countdown-container--status">
        <span className="countdown-label">Trip complete</span>
        <span className="countdown-sub">Thanks for packing along — see you next campout.</span>
      </div>
    );
  }

  if (phase === 'on') {
    return (
      <div className="countdown-container countdown-container--status">
        <span className="countdown-label">On the trip</span>
        {nightCaption ? <span className="countdown-sub">{nightCaption}</span> : null}
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <span className="countdown-label">Leaves in</span>
      <div className="countdown-time" aria-live="polite">
        <span className="time-unit">
          <span className="time-value">{days}</span>
          <span className="time-label">Days</span>
        </span>
        <span className="time-separator">:</span>
        <span className="time-unit">
          <span className="time-value">{hours}</span>
          <span className="time-label">Hours</span>
        </span>
        <span className="time-separator">:</span>
        <span className="time-unit">
          <span className="time-value">{minutes}</span>
          <span className="time-label">Min</span>
        </span>
        <span className="time-separator">:</span>
        <span className="time-unit">
          <span className="time-value">{seconds}</span>
          <span className="time-label">Sec</span>
        </span>
      </div>
    </div>
  );
};

export default TripCountdown;
