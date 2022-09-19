/**
 * @typedef {Object} CalendarEventUser
 * @property {string} id
 * @property {string} email
 * @property {string} displayName
 * @property {boolean} self
 */
/**
 * @typedef {Object} CalendarEventDate
 * @property {string} [date]
 * @property {string} [dateTime]
 * @property {string} [timeZone]
 */
/**
 * @typedef {Object} CalendarEventAttendee
 * @property {string} id
 * @property {string} email
 * @property {string} displayName
 * @property {boolean} organizer
 * @property {boolean} self
 * @property {boolean} resource
 * @property {boolean} optional
 * @property {"needsAction"|"declined"|"tentative"|"accepted"} responseStatus
 * @property {string} comment
 * @property {number} additionalGuests
 */
/**
 * @typedef {Object} CalendarEventExtendedProperties
 * @property {Record<string, string>} private
 * @property {Record<string, string>} shared
 */
/**
 * @typedef {Object} CalendarEventCreateRequest
 * @property {string} requestId
 * @property {{ type: "eventHangout"|"eventNamedHangout"|"hangoutsMeet"|"addOn" }} conferenceSolutionKey
 * @property {{ statusCode: "pending"|"success"|"failure" }} status
 */
/**
 * @typedef {Object} CalendarEventEntryPoint
 * @property {"video"|"phone"|"sip"|"more"} entryPointType
 * @property {string} uri
 * @property {string} label
 * @property {string} pin
 * @property {string} accessCode
 * @property {string} meetingCode
 * @property {string} passcode
 * @property {string} password
 */
/**
 * @typedef {Object} CalendarEventConferenceSolution
 * @property {{ type: "eventHangout"|"eventNamedHangout"|"hangoutsMeet"|"addOn" }} key
 * @property {string} name
 * @property {string} iconUri
 */
/**
 * @typedef {Object} CalendarEventConferenceData
 * @property {CalendarEventCreateRequest} createRequest
 * @property {CalendarEventEntryPoint[]} entryPoints
 * @property {CalendarEventConferenceSolution} conferenceSolution
 * @property {string} conferenceId
 * @property {string} signature
 * @property {string} notes
 */
/**
 * @typedef {Object} CalendarEventGadget
 * @property {string} type
 * @property {string} title
 * @property {string} link
 * @property {string} iconLink
 * @property {number} width
 * @property {number} height
 * @property {"icon"|"chip"} display
 * @property {Record<string, string>} preferences
 */
/**
 * @typedef {Object} CalendarEventReminders
 * @property {boolean} useDefault
 * @property {{ method: "email"|"popup", minute: number }[]} overrides
 */
/**
 * @typedef {Object} CalendarEventAttachment
 * @property {string} fileUrl
 * @property {string} title
 * @property {string} mimeType
 * @property {string} iconLink
 * @property {string} fileId
 */
/**
 * @typedef {Object} CalendarEvent
 * @property {"calendar#event"} kind
 * @property {string} etag
 * @property {string} id
 * @property {"confirmed"|"tentative"|"cancelled"} status
 * @property {string} htmlLink
 * @property {string} created
 * @property {string} updated
 * @property {string} summary
 * @property {string} description
 * @property {string} location
 * @property {string} colorId
 * @property {CalendarEventUser} creator
 * @property {CalendarEventUser} organizer
 * @property {CalendarEventDate} start
 * @property {CalendarEventDate} end
 * @property {boolean} endTimeUnspecified
 * @property {string[]} recurrence
 * @property {string} recurringEventId
 * @property {CalendarEventDate} originalStartTime
 * @property {"opaque"|"transparent"} transparency
 * @property {"default"|"public"|"private"|"confidential"} visibility
 * @property {string} iCalUID
 * @property {number} sequence
 * @property {CalendarEventAttendee[]} attendees
 * @property {boolean} attendeesOmitted
 * @property {CalendarEventExtendedProperties} extendedProperties
 * @property {string} hangoutLink
 * @property {CalendarEventConferenceData} conferenceData
 * @property {CalendarEventGadget} gadget
 * @property {boolean} anyoneCanAddSelf
 * @property {boolean} guestsCanInviteOthers
 * @property {boolean} guestsCanModify
 * @property {boolean} guestsCanSeeOtherGuests
 * @property {boolean} privateCopy
 * @property {boolean} locked
 * @property {CalendarEventReminders} reminders
 * @property {{ url: string, title: string }} source
 * @property {CalendarEventAttachment[]} attachments
 * @property {"default"|"outOfOffice"|"focusTime"} eventType
 */

void (function() {
    const formatShortDateIntl = new Intl.DateTimeFormat([], { month: 'short', day: 'numeric' });
    const formatShortDateAndTimeIntl = new Intl.DateTimeFormat([], { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });

    /** 
     * Returns a Date object that has the same date as the passed in Date, but with its time
     * normalized to 12:00 AM.
     * @param {string | number | Date} date The Date (or Date argument) to copy and normalize.
     * @returns {Date} A copy of the passed in Date with its time set to 12:00 AM.
     */
    const normalizedDate = (date) => {
        const copy = new Date(date);
        copy.setHours(0, 0, 0, 0);
        return copy;
    };

    /**
     * Formats a date into a shortened time string.
     * @param {Date} date The Date to format the time for.
     * @param {boolean} ampm Whether the include the "am"/"pm" suffix.
     * @returns {string} The formatted time string.
     */
    const formatShortTime = (date, ampm) => {
        return `${
            (date.getHours() % 12) || 12
        }${
            date.getMinutes() === 0 ? '' : ':' + date.getMinutes().toString().padStart(2, '0')
        }${
            ampm ? date.getHours() < 12 ? 'am' : 'pm' : ''
        }`;
    };

    /**
     * Formats a date into a shortened date string.
     * @param {Date} date The Date to format the date for.
     * @returns {string} The formatted date string.
     */
    const formatShortDate = (date) => {
        return formatShortDateIntl.format(date);
    };

    /**
     * Formats a date into a shortened date and time string.
     * @param {Date} date The Date to format the date and time for.
     * @returns {string} The formatted date and time string.
     */
    const formatShortDateAndTime = (date) => {
        return formatShortDateAndTimeIntl.format(date);
    };

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

        const widgetContainers = document.getElementsByClassName('upcoming-events-widget');

        for (const widgetContainer of widgetContainers) {
            widgetContainer.classList.add('upcoming-events-widget--loading');
            widgetContainer.classList.remove('upcoming-events-widget--errored');
            widgetContainer.innerHTML = '<div class="upcoming-events-widget__loading">Loading...</div>';
        }

        fetch(CALENDAR_URI + '?' + CALENDAR_SEARCH_PARAMS.toString())
            .then(response => response.json())
            .then(response => {
                /** @type {CalendarEvent[]} */
                const events = response.items;

                return events.map(event => {
                    /** @type {number} */
                    let daysDiff;
                    /** @type {string} */
                    let timeString;
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
                    div.classList.add('upcoming-events-widget__no-events');
                    div.innerText = 'No upcoming events. Check back later for more!';
                    eventElements.push(div);
                }

                const elementClones = Array.from({ length: widgetContainers.length });
                elementClones[0] = eventElements;

                for (let i = 1; i < widgetContainers.length; i++) {
                    elementClones[i] = Array.from({ length: eventElements.length });
                    for (let j = 0; j < eventElements.length; j++) {
                        elementClones[i][j] = eventElements[j].cloneNode(true);
                    }
                }

                for (let i = 0; i < widgetContainers.length; i++) {
                    // Add a class indicating whether the widget has events or not.
                    if (isEmpty) {
                        widgetContainers[i].classList.add('upcoming-events-widget--empty');
                        widgetContainers[i].classList.remove('upcoming-events-widget--filled');
                    } else {
                        widgetContainers[i].classList.add('upcoming-events-widget--filled');
                        widgetContainers[i].classList.remove('upcoming-events-widget--empty');
                    }

                    // Clear the widget container's children.
                    widgetContainers[i].textContent = '';

                    // Insert each event one-by-one.
                    for (const element of elementClones[i]) {
                        widgetContainers[i].appendChild(element);
                    }
                }
            })
            .catch(err => {
                const div = document.createElement('div');
                div.classList.add('upcoming-events-widget__errored');
                div.innerHTML = `
                    <div>There was a problem getting the events.</div>
                    <button>Try again</button>
                `;

                for (let i = 0; i < widgetContainers.length; i++) {
                    widgetContainers[i].classList.add('upcoming-events-widget--errored');

                    // Clear the widget container's children.
                    widgetContainers[i].textContent = '';

                    /** @type {HTMLDivElement} */
                    // @ts-ignore
                    const clone = div.cloneNode(true);

                    /** @type {HTMLButtonElement} */
                    // @ts-ignore
                    const button = clone.querySelector('button');
                    button.addEventListener('click', createWidgets);

                    widgetContainers[i].appendChild(clone);
                }
            }).finally(() => {
                // Remove the loading class.
                for (const widgetContainer of widgetContainers) {
                    widgetContainer.classList.remove('upcoming-events-widget--loading');
                }
            });
    };

    createWidgets();
})();