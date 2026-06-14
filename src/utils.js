export const ALLOWED_TIME_RANGES = new Set(['short_term', 'medium_term', 'long_term']);
export const ALLOWED_THEMES = new Set(['classic', 'midnight', 'stark', 'forest']);
export const ALLOWED_PREVIEW_MODES = new Set(['ticket', 'tag']);
export const ALLOWED_TRACK_LIMITS = new Set([5, 8, 10]);

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeHttpUrl(value) {
  if (!value) return '';

  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

export function safeMediaUrl(value) {
  if (!value) return '';

  try {
    const url = new URL(value, window.location.origin);
    return ['https:', 'http:', 'blob:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function formatDuration(ms = 0) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms) / 1000) || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function calculateCargoStats(tracks, timeRange = 'medium_term') {
  if (!tracks?.length) {
    return {
      flightTime: '0H 00M',
      cruisingAltitude: '32,000 FT',
      baggageWeight: '8.0 KG',
      passengerClass: 'TRAVEL CLASS',
      avgPopularity: 65,
      flightNo: 'TT26',
      wavePeakY: 15
    };
  }

  const totalMs = tracks.reduce((sum, track) => sum + (track.duration_ms || 0), 0);
  const totalSec = Math.floor(totalMs / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const avgPopularity = Math.round(
    tracks.reduce((sum, track) => sum + (track.popularity || 0), 0) / tracks.length
  );
  const explicitCount = tracks.filter(track => track.explicit).length;
  const firstTrackNameLength = tracks[0]?.name?.length || 0;

  let passengerClass = 'PREMIUM CLASS';
  if (avgPopularity > 75) passengerClass = 'FIRST CLASS';
  else if (avgPopularity < 45) passengerClass = 'EXPLORER CLASS';

  const flightNumbers = {
    short_term: 'SW04',
    medium_term: 'MM06',
    long_term: 'LT99'
  };

  return {
    flightTime: `${hrs}H ${mins.toString().padStart(2, '0')}M`,
    cruisingAltitude: `${(15000 + avgPopularity * 260).toLocaleString()} FT`,
    baggageWeight: `${(8.5 + explicitCount * 2.5 + firstTrackNameLength % 5).toFixed(1)} KG`,
    passengerClass,
    avgPopularity,
    flightNo: flightNumbers[timeRange] || 'TT26',
    wavePeakY: Math.max(2, 14 - Math.round(avgPopularity * 0.12))
  };
}

export function readPreset(search = '') {
  const params = new URLSearchParams(search);
  const trackLimit = Number(params.get('tracks'));

  return {
    timeRange: ALLOWED_TIME_RANGES.has(params.get('range')) ? params.get('range') : null,
    theme: ALLOWED_THEMES.has(params.get('theme')) ? params.get('theme') : null,
    previewMode: ALLOWED_PREVIEW_MODES.has(params.get('layout')) ? params.get('layout') : null,
    trackLimit: ALLOWED_TRACK_LIMITS.has(trackLimit) ? trackLimit : null
  };
}

export function buildPresetUrl(locationLike, preferences) {
  const url = new URL(locationLike.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('range', preferences.timeRange);
  url.searchParams.set('theme', preferences.theme);
  url.searchParams.set('layout', preferences.previewMode);
  url.searchParams.set('tracks', String(preferences.trackLimit));
  return url.toString();
}
