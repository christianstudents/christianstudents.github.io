import { AWSDateFormat } from "/daily/helpers.js";

const mrVerses = document.getElementById("mr-verses");
const mrExcerpts = document.getElementById("mr-excerpts");
const mrInstruction = document.getElementById("mr-instruction");
const mrCitation = document.getElementById("mr-citation");

const endpoint = "https://gi4zexzfnfcbzbz6luibswx2bi.appsync-api.us-west-1.amazonaws.com/graphql";
const apiKey = "da2-kcdik2ri5zflzgicrd2mgaz2dm";

// Access marked via global
const parseMarkdown = (text) => text ? window.marked.parse(text) : "";

const query = `
  query GetMorningRevival($date: AWSDate!) {
    getMorningRevival(date: $date) {
      date
      verses
      excerpts
      instruction
      citation
    }
  }
`;
/**
 * Fetch Daily Bread from AWS Amplify DataStore for a specific day
 */
export function fetchMorningRevival(dayIndex) {
  mrVerses.textContent = "";
  mrExcerpts.textContent = "";
  mrInstruction.textContent = "";
  mrCitation.textContent = "";

  const queryDate = AWSDateForDay(dayIndex);
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({
      query,
      variables: { date: queryDate }
    })
  })
    .then(res => res.json())
    .then(data => {
      const morningRevival = data.data.getMorningRevival;

      if (!morningRevival) {
        mrTitle.textContent = "No Morning Revival today :(";
        return;
      }

      mrExcerpts.innerHTML = parseMarkdown('**Excerpt**: ' + morningRevival.excerpts);
      const instructions = '**Guided Prayer**: ' + morningRevival.instruction
      mrInstruction.innerHTML = parseMarkdown(instructions);
      mrCitation.innerHTML = parseMarkdown(morningRevival.citation);
  if (morningRevival.verses && morningRevival.verses.length > 0) {
    fetch("/daily/assets/bible/Verses.json")
      .then(res => res.json())
      .then(allVerses => {
        const versesHTML = morningRevival.verses
          .map(ref => {
            const text = allVerses[ref] || "(Verse not found)";
            return `
                  <p class="verse">
                    <span class="verse-ref">${ref}</span>
                    <span class="verse-text">${text}</span>
                  </p>
                `;
          })
          .join("");

        mrVerses.innerHTML = versesHTML;
      })
      .catch(err => {
        console.error("Error loading Verses.json:", err);
        mrVerses.innerHTML = "<p>Could not load verses.</p>";
      });
  }
})
    .catch (err => {
  console.error("Error fetching Morning Revival:", err);
  mrTitle.textContent = "Error loading Morning Revival";
  mrVerses.textContent = "";
  mrExcerpts.textContent = "";
  mrInstruction.textContent = "";
  mrCitation.textContent = "";
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