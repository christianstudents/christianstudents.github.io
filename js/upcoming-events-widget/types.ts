import { calendar_v3 } from "@googleapis/calendar";

export type GoogleCalendarAPIResponse =
  | {
      events: calendar_v3.Schema$Event[];
    }
  | {
      message: string;
    };
