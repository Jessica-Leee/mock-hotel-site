const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("saved questionnaire pages resolve to the canonical Cloudflare root", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const source = html.match(/function nextStoredLocation\(survey\) \{[\s\S]*?\n        \}\n\n        async function initialize/);
  assert.ok(source, "survey navigation function exists");
  const context = {
    URLSearchParams,
    location: { search: "?participant_id=00000000-0000-4000-8000-000000000001&survey_stage=hotel_questionnaire" },
    cleanQuery: () => new URLSearchParams("?participant_id=00000000-0000-4000-8000-000000000001&survey_stage=hotel_questionnaire"),
    postReviewPages: [{ id: "post_review_choice" }],
    standardPages: () => [{ id: "student_id" }]
  };
  const navigate = vm.runInNewContext(`(${source[0].replace(/\n\n        async function initialize$/, "")})`, context);
  const base = "https://chicago-hotel-survey.pages.dev/?participant_id=00000000-0000-4000-8000-000000000001#hq1";
  const hotelQuestions = new URL(navigate({ current_page: "pre_review_hotel_ratings",
    participant_id: "00000000-0000-4000-8000-000000000001", condition: "full_reviews", survey_version: "2" }), base);
  assert.equal(hotelQuestions.pathname, "/");
  assert.equal(hotelQuestions.hash, "#hq1");
  const postReview = new URL(navigate({ current_page: "post_review_choice",
    participant_id: "00000000-0000-4000-8000-000000000001", condition: "full_reviews", survey_version: "2" }), base);
  assert.equal(postReview.pathname, "/");
  assert.equal(postReview.hash, "#pr1");
});
