const ACCOUNT_MGMT = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";
const LEGACY_V4 = "https://mybusiness.googleapis.com/v4";
const PERFORMANCE = "https://businessprofileperformance.googleapis.com/v1";

const LOCATION_READ_MASK =
  "name,title,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours,profile,metadata";

async function googleFetch(accessToken, url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(data.error?.message || `Google API error (${res.status})`);
    err.status = res.status;
    err.googleError = data.error;
    throw err;
  }
  return data;
}

/** Every GBP account the signed-in user manages. */
async function listAccounts(accessToken) {
  const data = await googleFetch(accessToken, `${ACCOUNT_MGMT}/accounts`);
  return data.accounts || [];
}

/** Every location under a GBP account, e.g. accountName = "accounts/12345". */
async function listLocations(accessToken, accountName) {
  const data = await googleFetch(
    accessToken,
    `${BUSINESS_INFO}/${accountName}/locations?readMask=${encodeURIComponent(LOCATION_READ_MASK)}`
  );
  return data.locations || [];
}

/** locationName = "accounts/12345/locations/67890". */
async function getLocation(accessToken, locationName) {
  return googleFetch(accessToken, `${BUSINESS_INFO}/${locationName}?readMask=${encodeURIComponent(LOCATION_READ_MASK)}`);
}

/** locationName = "accounts/12345/locations/67890" (legacy v4 resource path). */
async function listReviews(accessToken, locationName) {
  const data = await googleFetch(accessToken, `${LEGACY_V4}/${locationName}/reviews`);
  return data.reviews || [];
}

/** reviewName = "accounts/12345/locations/67890/reviews/abcde". */
async function replyToGoogleReview(accessToken, reviewName, comment) {
  return googleFetch(accessToken, `${LEGACY_V4}/${reviewName}/reply`, {
    method: "PUT",
    body: JSON.stringify({ comment }),
  });
}

async function createLocalPost(accessToken, locationName, post) {
  return googleFetch(accessToken, `${LEGACY_V4}/${locationName}/localPosts`, {
    method: "POST",
    body: JSON.stringify(post),
  });
}

async function deleteLocalPost(accessToken, postName) {
  return googleFetch(accessToken, `${LEGACY_V4}/${postName}`, { method: "DELETE" });
}

const DAILY_METRICS = [
  "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
  "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
  "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
  "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
  "CALL_CLICKS",
  "WEBSITE_CLICKS",
  "BUSINESS_DIRECTION_REQUESTS",
  "BUSINESS_CONVERSATIONS",
  "BUSINESS_BOOKINGS",
];

/** plainLocationName = "locations/67890" (no "accounts/..." prefix, per the Performance API). */
async function fetchDailyMetrics(accessToken, plainLocationName, startDate, endDate) {
  const params = new URLSearchParams();
  DAILY_METRICS.forEach((m) => params.append("dailyMetrics", m));
  params.append("dailyRange.start_date.year", startDate.year);
  params.append("dailyRange.start_date.month", startDate.month);
  params.append("dailyRange.start_date.day", startDate.day);
  params.append("dailyRange.end_date.year", endDate.year);
  params.append("dailyRange.end_date.month", endDate.month);
  params.append("dailyRange.end_date.day", endDate.day);
  return googleFetch(
    accessToken,
    `${PERFORMANCE}/${plainLocationName}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`
  );
}

/** plainLocationName = "locations/67890". year/month describe a single month. */
async function fetchSearchKeywords(accessToken, plainLocationName, year, month) {
  const params = new URLSearchParams({
    "monthlyRange.startMonth.year": year,
    "monthlyRange.startMonth.month": month,
    "monthlyRange.endMonth.year": year,
    "monthlyRange.endMonth.month": month,
    pageSize: 20,
  });
  return googleFetch(
    accessToken,
    `${PERFORMANCE}/${plainLocationName}/searchkeywords/impressions/monthly?${params.toString()}`
  );
}

/** "accounts/123/locations/456" -> "locations/456" (the Performance API's location resource format). */
function toPlainLocationName(googleLocationName) {
  const idx = googleLocationName.indexOf("locations/");
  return idx === -1 ? googleLocationName : googleLocationName.slice(idx);
}

module.exports = {
  listAccounts,
  listLocations,
  getLocation,
  listReviews,
  replyToGoogleReview,
  createLocalPost,
  deleteLocalPost,
  fetchDailyMetrics,
  fetchSearchKeywords,
  toPlainLocationName,
};
