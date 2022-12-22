import { initFirebase } from "../firebase";
import { getDatabase, ref, get as getRef } from "firebase/database";
import { localizedDateFormat } from "./helpers";
import { BibleBook, BibleChapter, DailyBreadData } from "./types";
import "./styles.scss";
import html from "../htmlTemplateTag";
import BEM from "../bem";

const bem = BEM("daily-bread-widget");

// This constant should also be changed /css/daily-bread-widget.scss.
const UNEXPANDED_LENGTH = 5;

const createWidgets = () => {
  "use strict";

  initFirebase();

  const db = getDatabase();

  // Set the date on each of the widgets.
  const now = new Date();
  const dailyBreadDate = `${now.getMonth() + 1}/${now
    .getDate()
    .toString()
    .padStart(2, "0")}`;
  for (const date of bem("date")) {
    date.textContent = dailyBreadDate;
  }

  const fetchDailyBread = () => {
    bem.modify({ state: "loading" });
    for (const title of bem("chapter-title")) {
      title.textContent = "Loading...";
    }
    for (const verseContainer of bem("verses")) {
      verseContainer.innerHTML = "";
    }

    getRef(ref(db, `dailyBread/${localizedDateFormat(now)}`))
      .then((snapshot) => {
        if (!snapshot.exists()) {
          // If there is no Daily Bread in the DB for today, show a message for that.
          return {
            ref: "No Daily Bread today :(",
            refLong: "No Daily Bread today :(",
            numVerses: 0,
            verses: [],
          };
        }

        const dailyBread: DailyBreadData = snapshot.val();

        return fetch(`../assets/bible/${dailyBread.bookName}.json`)
          .then((data) => data.json())
          .then((book: BibleBook) => book.chapters[dailyBread.chapterIdx]);
      })
      .then((chapter: BibleChapter) => {
        const versesHTML = chapter.verses
          .map(
            (verse) => html`
              <p class="${bem("verse")}">
                <span class="${bem("verse-ref")}">${verse.ref}</span>
                <span class="${bem("verse-text")}">${verse.text}</span>
              </p>
            `
          )
          .join("");

        for (const title of bem("chapter-title")) {
          title.textContent = chapter.refLong;
        }
        for (const verseContainer of bem("verses")) {
          verseContainer.innerHTML = versesHTML;
        }
        for (const expander of bem("expander")) {
          expander.removeAttribute("disabled");
          BEM.button.modify({ disabled: false }, expander);
          expander.addEventListener("click", () => {
            bem.modify({ expanded: true }, bem.root(expander)!);
          });
        }
        bem.modify({ state: "loaded" });
        bem.modify({
          expanded: chapter.verses.length <= UNEXPANDED_LENGTH,
        });
      })
      .catch((e) => {
        // Output the error to console for debugging.
        console.error(e);
        const div = document.createElement("div");
        div.classList.add(bem("error_msg").className);
        div.innerHTML = html`
          <div>There was a problem getting today's Daily Bread.</div>
          <button
            class="${BEM.button({
              bg: "primary",
              hover: "shadow",
              text: "lightest",
            })}"
          >
            Try again
          </button>
        `;

        bem.modify({ state: "errored" });
        for (const title of bem("chapter-title")) {
          title.textContent = "An error occurred.";
        }
        for (const verseContainer of bem("verses")) {
          verseContainer.textContent = "";

          const clone = div.cloneNode(true) as HTMLDivElement;
          const button = clone.querySelector("button")!;
          button.addEventListener("click", fetchDailyBread);

          verseContainer.appendChild(clone);
        }
      });
  };

  fetchDailyBread();
};

export default createWidgets;
