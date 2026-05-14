import { useState, useEffect, useMemo } from 'react';

const DEFAULT_TRIP_START_DATE = '2026-07-02';
/** When env is date-only (YYYY-MM-DD), trip begins at this local time. */
const DEFAULT_TRIP_START_HOUR = 17;

/**
 * Trip departure / meetup time in the viewer's local timezone.
 * - `YYYY-MM-DD` → that calendar day at 5:00 PM local (default hour).
 * - `YYYY-MM-DDTHH:mm` or `YYYY-MM-DDTHH:mm:ss` → explicit local time (suffix after T is split at Z/+/- for naive local parse).
 */
function parseLocalTripStart(iso) {
  const raw = (iso || DEFAULT_TRIP_START_DATE).trim();
  const [datePart, timePartRaw] = raw.split('T');
  const parts = datePart.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime())
      ? new Date(2026, 6, 2, DEFAULT_TRIP_START_HOUR, 0, 0, 0)
      : d;
  }
  const [y, m, d] = parts;
  if (timePartRaw) {
    const timePart = timePartRaw.split(/[Z+-]/)[0];
    const [hh = DEFAULT_TRIP_START_HOUR, mm = 0, ss = 0] = timePart.split(':').map((x) => Number(x));
    const hour = Number.isFinite(hh) ? hh : DEFAULT_TRIP_START_HOUR;
    const minute = Number.isFinite(mm) ? mm : 0;
    const second = Number.isFinite(ss) ? Math.floor(ss) : 0;
    return new Date(y, m - 1, d, hour, minute, second, 0);
  }
  return new Date(y, m - 1, d, DEFAULT_TRIP_START_HOUR, 0, 0, 0);
}

/**
 * Parse YYYY-MM-DD (or ISO datetime) into local start-of-day.
 */
function parseLocalDayStart(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const dayPart = iso.trim().split('T')[0];
  const parts = dayPart.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** Inclusive last trip day — end of local calendar day */
function parseLocalDayEndInclusive(iso) {
  const start = parseLocalDayStart(iso);
  if (!start || Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return end;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * @returns {'before'|'on'|'after'}
 */
function getPhase(now, tripStart, tripEndInclusive) {
  if (!tripStart || !tripEndInclusive) return 'before';
  if (now < tripStart) return 'before';
  if (now > tripEndInclusive) return 'after';
  return 'on';
}

function diffParts(target, now) {
  const difference = target - now;
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatShortDate(d) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function sameLocalCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * While on trip: pack-out on last day; otherwise "tonight" spans to next local day if still in window.
 */
function getNightCaption(now, tripStart, tripEndInclusive) {
  if (!tripStart || !tripEndInclusive) return '';
  if (getPhase(now, tripStart, tripEndInclusive) !== 'on') return '';

  if (sameLocalCalendarDay(now, tripEndInclusive)) {
    return 'Pack-out day — safe travels home';
  }

  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tripLastDayStart = new Date(
    tripEndInclusive.getFullYear(),
    tripEndInclusive.getMonth(),
    tripEndInclusive.getDate(),
  );
  if (tomorrowStart.getTime() <= tripLastDayStart.getTime()) {
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const b = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const extra =
      now.getMonth() === 6 && now.getDate() === 4 ? ' (Independence Day eve)' : '';
    return `Camp night: ${formatShortDate(a)} → ${formatShortDate(b)}${extra}`;
  }

  return 'On site — check the cook plan';
}

export function useTripCountdown() {
  const tripStartIso = import.meta.env.VITE_TRIP_START;
  const tripEndIso = import.meta.env.VITE_TRIP_END;

  const tripStart = useMemo(() => parseLocalTripStart(tripStartIso || DEFAULT_TRIP_START_DATE), [tripStartIso]);
  const tripEndInclusive = useMemo(
    () => parseLocalDayEndInclusive(tripEndIso || '2026-07-05'),
    [tripEndIso],
  );

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = getPhase(now, tripStart, tripEndInclusive);

  const countdownTarget = phase === 'before' ? tripStart : null;
  const { days, hours, minutes, seconds } = countdownTarget
    ? diffParts(countdownTarget, now)
    : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const nightCaption = getNightCaption(now, tripStart, tripEndInclusive);

  return {
    phase,
    days,
    hours,
    minutes,
    seconds,
    nightCaption,
    tripStart,
    tripEndInclusive,
    tripStartIso: tripStartIso || DEFAULT_TRIP_START_DATE,
    tripEndIso: tripEndIso || '2026-07-05',
    display: {
      days: pad2(days),
      hours: pad2(hours),
      minutes: pad2(minutes),
      seconds: pad2(seconds),
    },
  };
}
