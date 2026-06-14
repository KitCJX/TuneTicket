import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPresetUrl,
  calculateCargoStats,
  escapeHtml,
  formatDuration,
  readPreset
} from '../src/utils.js';

test('escapeHtml neutralizes markup and attribute delimiters', () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert('x')">`),
    '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;'
  );
});

test('formatDuration handles normal and invalid durations', () => {
  assert.equal(formatDuration(185000), '3:05');
  assert.equal(formatDuration(undefined), '0:00');
});

test('calculateCargoStats derives deterministic ticket values', () => {
  const stats = calculateCargoStats([
    { name: 'Alpha', duration_ms: 180000, popularity: 80, explicit: true },
    { name: 'Beta', duration_ms: 120000, popularity: 60, explicit: false }
  ], 'short_term');

  assert.equal(stats.flightTime, '0H 05M');
  assert.equal(stats.cruisingAltitude, '33,200 FT');
  assert.equal(stats.baggageWeight, '11.0 KG');
  assert.equal(stats.passengerClass, 'PREMIUM CLASS');
  assert.equal(stats.flightNo, 'SW04');
});

test('preset parsing accepts only supported values', () => {
  assert.deepEqual(readPreset('?range=short_term&theme=forest&layout=tag&tracks=8'), {
    timeRange: 'short_term',
    theme: 'forest',
    previewMode: 'tag',
    trackLimit: 8
  });
  assert.deepEqual(readPreset('?range=invalid&theme=neon&layout=poster&tracks=99'), {
    timeRange: null,
    theme: null,
    previewMode: null,
    trackLimit: null
  });
});

test('buildPresetUrl removes unrelated query data', () => {
  const url = buildPresetUrl(
    { href: 'https://example.com/app?code=secret#fragment' },
    { timeRange: 'long_term', theme: 'stark', previewMode: 'ticket', trackLimit: 10 }
  );

  assert.equal(
    url,
    'https://example.com/app?range=long_term&theme=stark&layout=ticket&tracks=10'
  );
});
