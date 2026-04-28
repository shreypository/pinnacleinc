const calendar = require("./google");

async function createMeeting(date, time) {
  try {
    // ✅ Validate inputs
    if (!date || !time) {
      throw new Error("Invalid date or time");
    }

    // ✅ Create start & end time
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

    // ❌ Check for invalid date
    if (isNaN(startDateTime.getTime())) {
      throw new Error("Invalid date format");
    }

    // ✅ Event object
    const event = {
      summary: "Pinnacle Consultation",
      description: "Scheduled via website",
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    // ✅ Insert event
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    // ✅ SAFE extraction of Meet link
    const meetLink =
      response?.data?.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === "video"
      )?.uri;

    // ⚠️ If Meet not generated
    if (!meetLink) {
      console.warn("⚠️ Meet link not found in response");
      return null;
    }

    console.log("🔗 Meet Link Created:", meetLink);

    return meetLink;

  } catch (error) {
    console.error("❌ Meet creation error:", error.message);
    return null;
  }
}

module.exports = createMeeting;