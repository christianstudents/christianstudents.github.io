import { formatShortDate, formatShortDateAndTime, formatShortTime, normalizedDate } from "./helpers";
import { calendar_v3 } from '@googleapis/calendar';
import './styles.scss';

/**
 * The widget base class name.
 */
const WIDGET_CLASS = 'upcoming-events-widget';

const createUpcomingEventsWidget = () => {
    'use strict';

    const createWidgets = () => {
        const now = new Date();
        const today = normalizedDate(now);
        // Only look for events in the next two months.
        const eventTimeLimit = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

        const CALENDAR_ID = '3d4later8u72ivm5lp2v9u10u0@group.calendar.google.com';
        const CALENDAR_API_KEY = 'AIzaSyAZPKKvjU7wLdPxD7yLGeSTzKSdw4aOzAs';
        const CALENDAR_URI = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`;
        const CALENDAR_SEARCH_PARAMS = new URLSearchParams({
            key: CALENDAR_API_KEY,
            singleEvents: 'true',
            timeMin: now.toISOString(),
            timeMax: eventTimeLimit.toISOString(),
            orderBy: 'startTime',
            maxResults: '30',
        });

        const widgetContainers = Array.from(document.getElementsByClassName(WIDGET_CLASS));

        for (const widgetContainer of widgetContainers) {
            widgetContainer.classList.add(`${WIDGET_CLASS}--loading`);
            widgetContainer.classList.remove(`${WIDGET_CLASS}--errored`);
            widgetContainer.innerHTML = `<div class="${WIDGET_CLASS}__loading">Loading...</div>`;
        }

        fetch(CALENDAR_URI + '?' + CALENDAR_SEARCH_PARAMS.toString())
            .then(response => response.json())
            .then((response: calendar_v3.Schema$Events) => {
                const events = response.items;

                return events.map(event => {
                    let daysDiff: number;
                    let timeString: string;
                    const allDayEvent = typeof event.start.date === 'string' && typeof event.end.date === 'string';

                    if (allDayEvent) {
                        const [startYear, startMonth, startDate] = (event.start.date || '').split('-');
                        const [endYear, endMonth, endDate] = (event.end.date || '').split('-');

                        const eventStartDate = normalizedDate(new Date(+startYear, +startMonth - 1, +startDate));
                        const eventEndDate = normalizedDate(new Date(+endYear, +endMonth - 1, +endDate - 1));

                        daysDiff = Math.round((eventStartDate.valueOf() - today.valueOf()) / (1000 * 60 * 60 * 24));

                        // Check if this event spans multiple days.
                        if (eventStartDate.valueOf() !== eventEndDate.valueOf()) {
                            // Check if this event spans into another month.
                            if (eventStartDate.getMonth() !== eventEndDate.getMonth()) {
                                timeString = `${formatShortDate(eventStartDate)} to ${formatShortDate(eventEndDate)}, all-day`;
                            } else {
                                timeString = `${formatShortDate(eventStartDate)}\u2013${eventEndDate.getDate()}, all-day`;
                            }
                        } else {
                            timeString = `${formatShortDate(eventStartDate)}, all-day`;
                        }
                    } else {
                        const eventStartDateTime = new Date(event.start.dateTime || new Date());
                        const eventStartDate = normalizedDate(eventStartDateTime);
                        const eventEndDateTime = new Date(event.end.dateTime || new Date());
                        const eventEndDate = normalizedDate(eventEndDateTime);

                        daysDiff = Math.round((eventStartDate.valueOf() - today.valueOf()) / (1000 * 60 * 60 * 24));

                        // Check if this event spans multiple days.
                        if (eventStartDate.valueOf() !== eventEndDate.valueOf()) {
                            timeString = `${
                                formatShortDate(eventStartDateTime)} to ${formatShortDateAndTime(eventEndDateTime)}`;
                        } else {
                            timeString = `${
                                formatShortDate(eventStartDate)
                            } from ${
                                formatShortTime(
                                    eventStartDateTime,
                                    (eventStartDateTime.getHours() < 12) !== (eventEndDateTime.getHours() < 12)
                                )
                            }\u2013${
                                formatShortTime(eventEndDateTime, true)
                            }`;
                        }
                    }

                    return {
                        name: event.summary,
                        time: timeString,
                        location: event.location,
                        subject: event.description,
                        daysToEvent: daysDiff <= 0 ? 'Today' : daysDiff === 1 ? 'Tomorrow' : `In ${daysDiff} days`,
                        link: event.htmlLink,
                    };
                });
            })
            .then(events => {
                return events.map(event => {
                    const div = document.createElement('div');
                    div.classList.add('upcoming-event');
                    div.innerHTML = `
                        <div class="upcoming-event__info-text">
                            <h3 class="upcoming-event__info-text__name">${event.name}</h3>
                            <div class="upcoming-event__info-text__time">${event.time || ''}</div>
                            <div class="upcoming-event__info-text__location">${event.location || ''}</div>
                        </div>
                        <div class="upcoming-event__subject">
                            <div class="upcoming-event__subject__text">${event.subject || ''}</div>
                        </div>
                        <div class="upcoming-event__calendar">
                            <div class="upcoming-event__calendar__text">${event.daysToEvent || ''}</div>
                            <a href="${event.link}" target="_blank" rel="external noreferrer" class="upcoming-event__calendar__icon fa-regular fa-calendar"></a>
                        </div>
                    `;
                    return div;
                });
            })
            .then(eventElements => {
                const isEmpty = eventElements.length === 0;
                if (isEmpty) {
                    const div = document.createElement('div');
                    div.classList.add(`${WIDGET_CLASS}__no-events`);
                    div.innerText = 'No upcoming events. Check back later for more!';
                    eventElements.push(div);
                }

                const elementClones = Array.from<typeof eventElements>({ length: widgetContainers.length });
                elementClones[0] = eventElements;

                for (let i = 1; i < widgetContainers.length; i++) {
                    elementClones[i] = Array.from({ length: eventElements.length });
                    for (let j = 0; j < eventElements.length; j++) {
                        elementClones[i][j] = eventElements[j].cloneNode(true) as typeof eventElements[number];
                    }
                }

                for (let i = 0; i < widgetContainers.length; i++) {
                    // Add a class indicating whether the widget has events or not.
                    if (isEmpty) {
                        widgetContainers[i].classList.add(`${WIDGET_CLASS}--empty`);
                        widgetContainers[i].classList.remove(`${WIDGET_CLASS}--filled`);
                    } else {
                        widgetContainers[i].classList.add(`${WIDGET_CLASS}--filled`);
                        widgetContainers[i].classList.remove(`${WIDGET_CLASS}--empty`);
                    }

                    // Clear the widget container's children.
                    widgetContainers[i].textContent = '';

                    // Insert each event one-by-one.
                    for (const element of elementClones[i]) {
                        widgetContainers[i].appendChild(element);
                    }
                }
            })
            .catch(() => {
                const div = document.createElement('div');
                div.classList.add(`${WIDGET_CLASS}__errored`);
                div.innerHTML = `
                    <div>There was a problem getting the events.</div>
                    <button class="button button--bg-primary button--text-lightest button--hover-shadow">Try again</button>
                `;

                for (let i = 0; i < widgetContainers.length; i++) {
                    widgetContainers[i].classList.add(`${WIDGET_CLASS}--errored`);

                    // Clear the widget container's children.
                    widgetContainers[i].textContent = '';

                    const clone = div.cloneNode(true) as HTMLDivElement;
                    const button = clone.querySelector('button')!;
                    button.addEventListener('click', createWidgets);

                    widgetContainers[i].appendChild(clone);
                }
            }).finally(() => {
                // Remove the loading class.
                for (const widgetContainer of widgetContainers) {
                    widgetContainer.classList.remove(`${WIDGET_CLASS}--loading`);
                }
            });
    };

    createWidgets();
};

export default createUpcomingEventsWidget;