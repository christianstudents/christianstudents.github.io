/** 
 * Returns a Date object that has the same date as the passed in Date, but with its time normalized
 * to 12:00 AM.
 * @param date The Date (or Date argument) to copy and normalize.
 * @returns A copy of the passed in Date with its time set to 12:00 AM.
 */
export const normalizedDate = (...date: ConstructorParameters<typeof Date>): Date => {
    const copy = new Date(...date);
    copy.setHours(0, 0, 0, 0);
    return copy;
};

const formatShortDateIntl = new Intl.DateTimeFormat([], { month: 'short', day: 'numeric' });
const formatShortDateAndTimeIntl = new Intl.DateTimeFormat([], { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });

/**
 * Formats a date into a shortened time string.
 * @param date The Date to format the time for.
 * @param ampm Whether the include the "am"/"pm" suffix.
 * @returns The formatted time string.
 */
export const formatShortTime = (date: Date, ampm: boolean): string => {
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
 * @param date The Date to format the date for.
 * @returns The formatted date string.
 */
export const formatShortDate = (date: Date): string => {
    return formatShortDateIntl.format(date);
};

/**
 * Formats a date into a shortened date and time string.
 * @param date The Date to format the date and time for.
 * @returns The formatted date and time string.
 */
export const formatShortDateAndTime = (date: Date): string => {
    return formatShortDateAndTimeIntl.format(date);
};