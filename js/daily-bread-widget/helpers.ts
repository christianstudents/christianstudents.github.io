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

export const AWSDateFormat = (date: Date):string=>{
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);  // getMonth() returns months from 0-11
        let day = '' + d.getDate();
        const year = d.getFullYear();
      
        // Pad the month and day with leading zeros if necessary
        if (month.length < 2) 
          month = '0' + month;
        if (day.length < 2) 
          day = '0' + day;
      
        return [year, month, day].join('-');
}