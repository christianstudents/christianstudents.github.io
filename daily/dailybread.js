import { AWSDateFormat } from "/daily/helpers.js";

const chapterTitle = document.getElementById("chapter-title");
const versesDiv = document.getElementById("verses");

const endpoint = "https://gi4zexzfnfcbzbz6luibswx2bi.appsync-api.us-west-1.amazonaws.com/graphql";
const apiKey = "da2-kcdik2ri5zflzgicrd2mgaz2dm";

const query = `
  query GetDailyBread($date: AWSDate!) {
    getDailyBread(date: $date) {
      date
      bookName
      chapterIdx
    }
  }
`;
/**
 * Fetch Daily Bread from AWS Amplify DataStore for a specific day
 */
export function fetchDailyBread(dayIndex) {
    chapterTitle.textContent = "Loading...";
    versesDiv.innerHTML = "";
    const queryDate = AWSDateForDay(dayIndex)
    fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
        },
        body: JSON.stringify({ query, variables: { date: queryDate } })
    }).then(res => res.json())
        .then(data => {
            const db = data.data.getDailyBread
            console.log(db)
            if (!db) {
                chapterTitle.textContent = "No Daily Bread today :(";
                versesDiv.innerHTML = "";
                return;
            }

            return fetch(`/daily/assets/bible/${db.bookName}.json`)
                .then(res => res.json())
                .then(book => book.chapters[Number(db.chapterIdx)]);
        })
        .then(chapter => {
            if (!chapter) return;

            chapterTitle.textContent = chapter.refLong;
            versesDiv.innerHTML = chapter.verses.map((v, idx) =>
                `<p class="verse">
          <span class="verse-ref">${idx+1}</span>
          <span class="verse-text">${v.text}</span>
        </p>`
            ).join("");
        })
        .catch(err => {
            console.error(err);
            chapterTitle.textContent = "Error loading Daily Bread";
            versesDiv.innerHTML = "<p>Try again later.</p>";
        });
}

/**
 * Convert day index to a date string for AWS query
 */
function AWSDateForDay(dayIndex) {
    const today = new Date();
    const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const diff = dayIndex - currentDayIndex;
    const date = new Date();
    date.setDate(date.getDate() + diff);
    return AWSDateFormat(date);
}