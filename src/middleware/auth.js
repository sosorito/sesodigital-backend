const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

/**
 * Verifies the Google ID token the Android app sends as `Authorization: Bearer <idToken>`
 * (the token RealGoogleAuthManager.signIn() produces). On success, attaches the verified
 * account to req.user; otherwise responds 401.
 */
async function requireGoogleAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!idToken) {
    return res.status(401).json({ error: "Missing Authorization: Bearer <idToken> header." });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    req.user = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      photoUrl: payload.picture,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired Google ID token." });
  }
}

/** Requires the `X-Google-Access-Token` header (a business.manage-scoped OAuth access token) for routes that must call Google's Business Profile APIs. */
function requireGoogleAccessToken(req, res, next) {
  const token = req.headers["x-google-access-token"];
  if (!token) {
    return res.status(400).json({ error: "Missing X-Google-Access-Token header." });
  }
  req.googleAccessToken = token;
  next();
}

/** Attaches the Google access token if present, without failing when it's absent (best-effort Google sync). */
function attachGoogleAccessToken(req, res, next) {
  req.googleAccessToken = req.headers["x-google-access-token"] || null;
  next();
}

module.exports = { requireGoogleAuth, requireGoogleAccessToken, attachGoogleAccessToken };
