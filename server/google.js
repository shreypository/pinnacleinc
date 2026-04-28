const { google } = require("googleapis");
const config = require("./config"); // ✅ MUST BE HERE

const oauth2Client = new google.auth.OAuth2(
  config.CLIENT_ID,
  config.CLIENT_SECRET,
  "http://localhost:5000/oauth2callback"
);

oauth2Client.setCredentials({
  refresh_token: config.REFRESH_TOKEN,
});

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

module.exports = calendar;