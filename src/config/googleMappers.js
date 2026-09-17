const STAR_RATING_TO_NUMBER = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const DAY_NAMES = ["", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function formatTimeOfDay(time) {
  if (!time) return "";
  const hours = time.hours || 0;
  const minutes = time.minutes || 0;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function mapGoogleHoursToOurs(regularHours) {
  const periods = regularHours?.periods || [];
  const byDay = new Map();
  for (const period of periods) {
    byDay.set(period.openDay, {
      day: period.openDay.charAt(0) + period.openDay.slice(1).toLowerCase(),
      open: formatTimeOfDay(period.openTime),
      close: formatTimeOfDay(period.closeTime),
      isClosed: false,
    });
  }
  return ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(
    (day) =>
      byDay.get(day) || {
        day: day.charAt(0) + day.slice(1).toLowerCase(),
        open: "",
        close: "",
        isClosed: true,
      }
  );
}

/** Converts a Business Information API Location resource into our BusinessProfile field shape. */
function mapGoogleLocationToProfile(location) {
  const address = location.storefrontAddress;
  const addressLine = address
    ? [...(address.addressLines || []), address.locality, address.administrativeArea, address.postalCode]
        .filter(Boolean)
        .join(", ")
    : "";

  return {
    googleAccountName: location.name ? location.name.split("/locations/")[0] : undefined,
    googleLocationName: location.name,
    name: location.title || "",
    category: location.categories?.primaryCategory?.displayName || "",
    additionalCategories: (location.categories?.additionalCategories || []).map((c) => c.displayName),
    description: location.profile?.description || "",
    address: addressLine,
    phone: location.phoneNumbers?.primaryPhone || "",
    website: location.websiteUri || "",
    hours: mapGoogleHoursToOurs(location.regularHours),
    status: location.metadata?.hasVoiceOfMerchant ? "VERIFIED" : "PENDING_VERIFICATION",
  };
}

/** Converts a legacy v4 Review resource into our Review field shape. */
function mapGoogleReviewToReview(review) {
  const reviewerName = review.reviewer?.displayName || "Anonymous";
  return {
    googleReviewName: review.name,
    reviewerName,
    reviewerInitial: reviewerName.charAt(0).toUpperCase(),
    rating: STAR_RATING_TO_NUMBER[review.starRating] || 0,
    text: review.comment || "",
    date: review.createTime ? new Date(review.createTime).toLocaleDateString() : "",
    hasResponse: Boolean(review.reviewReply),
    responseText: review.reviewReply?.comment || null,
    sentiment:
      STAR_RATING_TO_NUMBER[review.starRating] >= 4
        ? "POSITIVE"
        : STAR_RATING_TO_NUMBER[review.starRating] === 3
        ? "NEUTRAL"
        : "NEGATIVE",
  };
}

module.exports = { mapGoogleLocationToProfile, mapGoogleReviewToReview };
