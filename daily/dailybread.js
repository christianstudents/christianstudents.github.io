import { AWSDateFormat, timeAgo } from "/daily/helpers.js";


const chapterTitle = document.getElementById("chapter-title");
const versesDiv = document.getElementById("verses");
const commentsDiv = document.getElementById("comments"); // New div for comments

const endpoint = "https://gi4zexzfnfcbzbz6luibswx2bi.appsync-api.us-west-1.amazonaws.com/graphql";
const apiKey = "da2-kcdik2ri5zflzgicrd2mgaz2dm";

const query = `
  query GetDailyBread($date: AWSDate!) {
    getDailyBread(date: $date) {
      date
      bookName
      chapterIdx
      comments {
        items {
          id
          name
          text
          datetime
          username
          _version
        }
      }
    }
  }
`;

/**
 * Fetch Daily Bread from AWS Amplify DataStore for a specific day
 */
export function fetchDailyBread(dayIndex) {
    chapterTitle.textContent = "Loading...";
    versesDiv.innerHTML = "";
    commentsDiv.innerHTML = "";
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
            // Populate comments
            if (db.comments?.items?.length) {
                // Sort comments by datetime ascending
                const username = localStorage.getItem("guestUserId") || "guest";
                const sortedComments = db.comments.items.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
                // Render comments
                commentsDiv.innerHTML = sortedComments.map((c, idx) => {
                    return `
            <div class="comment" data-idx="${idx}" data-id="${c.id}" data-version="${c._version}">
                <p class="comment-text">
                    <strong>${c.name}:</strong> ${c.text}
                </p>
                <p class="comment-date">${timeAgo(c.datetime)}</p>
            </div>
        `;
                }).join("")
            } else {
                commentsDiv.innerHTML = "";
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
          <span class="verse-ref">${idx + 1}</span>
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
