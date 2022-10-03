/**
 * Formats a Date object into a string in the format MM D, YYYY.
 * @param date The Date to format.
 * @returns The formatted date.
 */
export const localizedDateFormat = (date: Date): string => {
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
};