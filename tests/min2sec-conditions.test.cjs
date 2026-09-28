const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const variants = [
  ['survey-min2sec.html', 'full_reviews_min2sec', '2'],
  ['survey-summaries-min2sec.html', 'ai_summary_min2sec', '3']
];

test('2-second entry pages select distinct database conditions', () => {
  for (const [file, condition, version] of variants) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, new RegExp(`study_condition\", \"${condition}`));
    assert.match(html, new RegExp(`study_version\", \"${version}`));
  }
});

test('the database migration permits both new conditions without changing rows', () => {
  const sql = fs.readFileSync('backend/supabase/002_add_min2sec_conditions.sql', 'utf8');
  assert.match(sql, /full_reviews_min2sec/);
  assert.match(sql, /ai_summary_min2sec/);
  assert.doesNotMatch(sql, /\b(delete|truncate|drop table)\b/i);
});
