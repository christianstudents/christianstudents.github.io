export const localizedDateFormat = (date) => {
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
};
export function AWSDateForDay(dayIndex) {
    const today = new Date();
    const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const diff = dayIndex - currentDayIndex;
    const date = new Date();
    date.setDate(date.getDate() + diff);
    return AWSDateFormat(date);
}

export const AWSDateFormat = (date)=>{
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

// Helper function to format relative time
export function timeAgo(datetime) {
    const now = new Date();
    const past = new Date(datetime);
    const diffMs = now - past; // difference in milliseconds

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return "just now";
    if (minutes < 60) return minutes === 1 ? "a minute ago" : `${minutes} minutes ago`;
    if (hours < 24) return hours === 1 ? "an hour ago" : `${hours} hours ago`;
    if (days < 7) return days === 1 ? "yesterday" : `${days} days ago`;
    if (weeks < 5) return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;
    if (months < 12) return months === 1 ? "a month ago" : `${months} months ago`;
    return years === 1 ? "a year ago" : `${years} years ago`;
}