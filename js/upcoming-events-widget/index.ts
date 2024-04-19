import {
  formatShortDate,
  formatShortDateAndTime,
  formatShortTime,
  normalizedDate,
} from "./helpers";
import "./styles.scss";
import BEM from "../bem";
import html from "../htmlTemplateTag";
import { GoogleCalendarAPIResponse } from "./types";

const widgetBem = BEM("upcoming-events-widget");
const eventBem = BEM("upcoming-event");

const createWidgets = () => {
  "use strict";

  /**
   * The API endpoint for retrieving upcoming events.
   */
  const ENDPOINT = `https://scs-app-backend-481f8.web.app/api/v1/events10`;
  const widgetContainers = widgetBem.select();

  const fetchEvents = () => {
    const now = new Date();
    const today = normalizedDate(now);

    widgetBem.modify({ state: "loading" });
    for (const widget of widgetContainers) {
      widget.innerHTML = html`<div class="${widgetBem("loading")}">
        Loading...
      </div>`;
    }

    fetch(ENDPOINT)
      .then((response) => response.json())
      .then((response: GoogleCalendarAPIResponse) => {
        const events =
          "events" in response && response.events ? response.events : [];

        return events.map((event) => {
          let daysDiff: number;
          let timeString: string;
          const allDayEvent =
            typeof event.start?.date === "string" &&
            typeof event.end?.date === "string";

          if (allDayEvent) {
            const [startYear, startMonth, startDate] = (
              event.start?.date || ""
            ).split("-");
            const [endYear, endMonth, endDate] = (event.end?.date || "").split(
              "-"
            );

            const eventStartDate = normalizedDate(
              new Date(+startYear, +startMonth - 1, +startDate)
            );
            const eventEndDate = normalizedDate(
              new Date(+endYear, +endMonth - 1, +endDate - 1)
            );

            daysDiff = Math.round(
              (eventStartDate.valueOf() - today.valueOf()) /
                (1000 * 60 * 60 * 24)
            );

            // Check if this event spans multiple days.
            if (eventStartDate.valueOf() !== eventEndDate.valueOf()) {
              // Check if this event spans into another month.
              if (eventStartDate.getMonth() !== eventEndDate.getMonth()) {
                timeString = `${formatShortDate(
                  eventStartDate
                )} to ${formatShortDate(eventEndDate)}, all-day`;
              } else {
                timeString = `${formatShortDate(
                  eventStartDate
                )}\u2013${eventEndDate.getDate()}, all-day`;
              }
            } else {
              timeString = `${formatShortDate(eventStartDate)}, all-day`;
            }
          } else {
            const eventStartDateTime = new Date(
              event.start?.dateTime || new Date()
            );
            const eventStartDate = normalizedDate(eventStartDateTime);
            const eventEndDateTime = new Date(
              event.end?.dateTime || new Date()
            );
            const eventEndDate = normalizedDate(eventEndDateTime);

            daysDiff = Math.round(
              (eventStartDate.valueOf() - today.valueOf()) /
                (1000 * 60 * 60 * 24)
            );

            // Check if this event spans multiple days.
            if (eventStartDate.valueOf() !== eventEndDate.valueOf()) {
              timeString = `${formatShortDate(
                eventStartDateTime
              )} to ${formatShortDateAndTime(eventEndDateTime)}`;
            } else {
              timeString = `${formatShortDate(
                eventStartDate
              )} from ${formatShortTime(
                eventStartDateTime,
                eventStartDateTime.getHours() < 12 !==
                  eventEndDateTime.getHours() < 12
              )}\u2013${formatShortTime(eventEndDateTime, true)}`;
            }
          }

          return {
            name: event.summary,
            time: timeString,
            location: event.location,
            subject: event.description,
            daysToEvent:
              daysDiff <= 0
                ? "Today"
                : daysDiff === 1
                ? "Tomorrow"
                : `In ${daysDiff} days`,
            link: event.htmlLink,
          };
        });
      })
      .then((events) => {
        return events.map((event) => {
          const div = document.createElement("div");
          div.classList.add(eventBem.className);
          div.innerHTML = html`
            <div class="${eventBem("info-text")}">
              <h3 class="${eventBem("info-text-name")}">${event.name}</h3>
              <div class="${eventBem("info-text-time")}">
                ${event.time || ""}
              </div>
              <div class="${eventBem("info-text-location")}">
                ${event.location || ""}
              </div>
            </div>
            <div class="${eventBem("subject")}">
              <div class="${eventBem("subject-text")}">
                ${event.subject || ""}
              </div>
            </div>
            <div class="${eventBem("calendar")}">
              <div class="${eventBem("calendar-text")}">
                ${event.daysToEvent || ""}
              </div>
              <a
                href="${event.link}"
                target="_blank"
                rel="external noreferrer"
                class="${eventBem("calendar-icon")} fa-regular fa-calendar"
              ></a>
            </div>
          `;
          return div;
        });
      })
      .then((eventElements) => {
        const isEmpty = eventElements.length === 0;
        if (isEmpty) {
          const div = document.createElement("div");
          div.classList.add(`${widgetBem("no-events")}`);
          div.innerText = "No upcoming events. Check back later for more!";
          eventElements.push(div);
        }

        const elementClones = Array.from<typeof eventElements>({
          length: widgetContainers.length,
        });
        elementClones[0] = eventElements;

        for (let i = 1; i < widgetContainers.length; i++) {
          elementClones[i] = Array.from({ length: eventElements.length });
          for (let j = 0; j < eventElements.length; j++) {
            elementClones[i][j] = eventElements[j].cloneNode(
              true
            ) as typeof eventElements[number];
          }
        }

        // Add a class indicating whether the widget has events or not.
        widgetBem.modify({ empty: isEmpty, filled: !isEmpty });
        for (let i = 0; i < widgetContainers.length; i++) {
          // Clear the widget container's children.
          widgetContainers[i].textContent = "";

          // Insert each event one-by-one.
          for (const element of elementClones[i]) {
            widgetContainers[i].appendChild(element);
          }
        }
      })
      .catch(() => {
        const div = document.createElement("div");
        div.classList.add(widgetBem("errored").className);
        div.innerHTML = html`
          <div>There was a problem getting the events.</div>
          <button
            class="${BEM.button({
              bg: "primary",
              text: "lightest",
              hover: "shadow",
            })}"
          >
            Try again
          </button>
        `;

        widgetBem.modify({ state: "errored" });

        for (let i = 0; i < widgetContainers.length; i++) {
          // Clear the widget container's children.
          widgetContainers[i].textContent = "";

          const clone = div.cloneNode(true) as HTMLDivElement;
          const button = clone.querySelector("button")!;
          button.addEventListener("click", fetchEvents);

          widgetContainers[i].appendChild(clone);
        }
      });
  };

  fetchEvents();
};

export default createWidgets;
