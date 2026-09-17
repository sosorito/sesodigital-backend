const BusinessProfile = require("../models/BusinessProfile");
const { fetchDailyMetrics, toPlainLocationName } = require("../config/googleBusinessApi");

function mergeSeries(...seriesArrays) {
  const byDate = new Map();
  for (const series of seriesArrays) {
    for (const dv of series || []) {
      const key = `${dv.date.year}-${dv.date.month}-${dv.date.day}`;
      byDate.set(key, (byDate.get(key) || 0) + Number(dv.value || 0));
    }
  }
  return Array.from(byDate.values());
}

function seriesFor(datedValues) {
  return (datedValues || []).map((dv) => Number(dv.value || 0));
}

function buildMetric(label, values) {
  return { label, value: values.reduce((a, b) => a + b, 0), changePercent: 0, series: values };
}

function groupByMetric(response) {
  const map = {};
  for (const group of response.multiDailyMetricTimeSeries || []) {
    for (const entry of group.dailyMetricTimeSeries || []) {
      map[entry.dailyMetric] = entry.timeSeries?.datedValues || [];
    }
  }
  return map;
}

/** GET /api/performance/overview?year=2026&month=9 — real Business Profile performance metrics. */
async function getOverview(req, res) {
  const now = new Date();
  const year = parseInt(req.query.year, 10) || now.getFullYear();
  const month = parseInt(req.query.month, 10) || now.getMonth() + 1;

  const profile = await BusinessProfile.findOne({ ownerGoogleId: req.user.googleId });
  if (!profile?.googleLocationName) {
    return res.status(400).json({ error: "Sync your Business Profile first (POST /api/profile/sync)." });
  }

  const plainLocation = toPlainLocationName(profile.googleLocationName);
  const startDate = { year, month, day: 1 };
  const endDate = { year, month, day: new Date(year, month, 0).getDate() };

  const response = await fetchDailyMetrics(req.googleAccessToken, plainLocation, startDate, endDate);
  const byMetric = groupByMetric(response);

  const impressionsSeries = mergeSeries(
    byMetric.BUSINESS_IMPRESSIONS_DESKTOP_MAPS,
    byMetric.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH,
    byMetric.BUSINESS_IMPRESSIONS_MOBILE_MAPS,
    byMetric.BUSINESS_IMPRESSIONS_MOBILE_SEARCH
  );

  const calls = buildMetric("Calls", seriesFor(byMetric.CALL_CLICKS));
  const websiteClicks = buildMetric("Website Clicks", seriesFor(byMetric.WEBSITE_CLICKS));
  const directionRequests = buildMetric("Direction Requests", seriesFor(byMetric.BUSINESS_DIRECTION_REQUESTS));
  const chatClicks = buildMetric("Chat Clicks", seriesFor(byMetric.BUSINESS_CONVERSATIONS));
  const bookings = buildMetric("Bookings", seriesFor(byMetric.BUSINESS_BOOKINGS));
  const profileViews = buildMetric("Profile Views", impressionsSeries);
  const interactionsValue = calls.value + websiteClicks.value + directionRequests.value + chatClicks.value + bookings.value;

  res.json({
    profileViews,
    interactions: { label: "Interactions", value: interactionsValue, changePercent: 0, series: [] },
    calls,
    websiteClicks,
    directionRequests,
    chatClicks,
    bookings,
    searchPerformance: buildMetric("Search Views", impressionsSeries),
    discoveryInsights: null,
  });
}

module.exports = { getOverview };
