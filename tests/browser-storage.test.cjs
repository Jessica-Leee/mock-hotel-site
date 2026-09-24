const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

test('runtime code does not use browser-persistent storage', () => {
  const files = [
    'index.html',
    'assets/js/hotel-listings.js',
    'assets/js/shopper-profile.js',
    'assets/js/survey-storage.js',
    'assets/js/survey-tracking.js'
  ];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/, file);
  }
});
