const calendar = require("./google");

async function createMeeting(date, time) {
  try {
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

    const event = {
      summary: "Pinnacle Consultation",
      description: "Scheduled via website",
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata"
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata"
      },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1
    });

    const meetLink =
      response.data.conferenceData.entryPoints[0].uri;

    return meetLink;

  } catch (error) {
    console.error("❌ Meet creation error:", error);
    return null;
  }
}

module.exports = createMeeting;