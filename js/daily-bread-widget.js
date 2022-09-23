/**
 * @typedef {Object} DailyBreadData
 * @property {string} bookName
 * @property {number} chapterIdx
 * @property {number} readCounts
 */
/**
 * @typedef {Object} BibleVerse
 * @property {string} ref
 * @property {string} refLong
 * @property {string} text
 */
/**
 * @typedef {Object} BibleChapter
 * @property {string} ref
 * @property {string} refLong
 * @property {number} numVerses
 * @property {BibleVerse[]} verses
 */
/**
 * @typedef {Object} BibleBook
 * @property {string} ref
 * @property {string} refLong
 * @property {number} numChapters
 * @property {BibleChapter[]} chapters
 */
/**
 * @typedef {Object} RTDBSnapshot
 * @property {() => boolean} exists
 * @property {() => any} val
 */
/**
 * @typedef {Object} RTDBRef
 * @property {() => Promise<RTDBSnapshot>} get
 */
/**
 * @typedef {Object} RTDB
 * @property {(path: string) => RTDBRef} ref
 */
/**
 * @typedef {Object} Firebase
 * @property {(config: Record<string, unknown>) => void} initializeApp
 * @property {() => RTDB} database
 */

void (function() {
    'use strict';

    // This constant should also be changes in /css/daily-bread-widget.scss.
    const UNEXPANDED_LENGTH = 5;

    /**
     * Initializes Firebase by injecting `<script>`s into the DOM. Returns a Promise that resolves
     * once Firebase is initialized.
     * @returns {Promise<Firebase>}
     */
    const initFirebase = () => {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            if (typeof window.firebase !== 'undefined') return resolve(window.firebase);

            const firebaseBase = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
            const firebaseLibraries = [
                'https://www.gstatic.com/firebasejs/8.10.1/firebase-analytics.js',
                'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js',
            ];

            let loaded = 0;
            const loadScript = () => {
                loaded++;
                if (loaded >= firebaseLibraries.length) {
                    // @ts-ignore
                    const firebase = /** @type {Firebase} */(window.firebase);
                    firebase.initializeApp({
                        apiKey: "AIzaSyCxDl12rgil0SFWpRWYB-CibPiZfBJR_tc",
                        authDomain: "scs-app-backend-481f8.firebaseapp.com",
                        databaseURL: "https://scs-app-backend-481f8-default-rtdb.firebaseio.com",
                        projectId: "scs-app-backend-481f8",
                        storageBucket: "scs-app-backend-481f8.appspot.com",
                        messagingSenderId: "476719591689",
                        appId: "1:476719591689:web:00bd04d59492bbb8cfe3d8",
                        measurementId: "G-52SQH82S7J"
                    });
                    resolve(firebase);
                }
            };

            // Load the base firebase library first (firebase-app) then load the rest. This makes
            // sure the base is loaded first (sometimes the others would load first for some reason
            // and cause an error).
            const baseScript = document.createElement('script');
            baseScript.type = 'text/javascript';
            baseScript.addEventListener('load', () => {
                for (const source of firebaseLibraries) {
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.addEventListener('load', loadScript);
                    script.addEventListener('error', reject);
                    script.src = source;
                    document.body.appendChild(script);
                }
            });
            baseScript.addEventListener('error', reject);
            baseScript.src = firebaseBase;
            document.body.appendChild(baseScript);
        });
    };

    /**
     * Formats a Date object into a string in the format MM D, YYYY.
     * @param {Date} date The Date to format.
     * @returns {string} The formatted date.
     */
    const localizedDateFormat = (date) => {
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    const widgets = Array.from(document.getElementsByClassName('daily-bread-widget'));

    // Set the date on each of the widgets.
    const now = new Date();
    const dailyBreadDate = `${now.getMonth() + 1}/${now.getDate().toString().padStart(2, '0')}`;
    for (const date of widgets.flatMap(container => Array.from(container.querySelectorAll('.daily-bread-widget__date')))) {
        date.textContent = dailyBreadDate;
    }

    const fetchDailyBread = () => {
        for (const widget of widgets) {
            widget.classList.add('daily-bread-widget--loading');
            widget.classList.remove('daily-bread-widget--errored');
            for (const title of widget.querySelectorAll('.daily-bread-widget__chapter-title')) {
                title.textContent = 'Loading...';
            }
            for (const verseContainer of widget.querySelectorAll('.daily-bread-widget__verses')) {
                verseContainer.innerHTML = '';
            }
        }

        initFirebase().then((firebase) =>
            firebase.database().ref(`dailyBread/${localizedDateFormat(now)}`).get()
        ).then((snapshot) => {
            if (!snapshot.exists()) {
                return {
                    ref: 'No Daily Bread today :(',
                    refLong: 'No Daily Bread today :(',
                    numVerses: 0,
                    verses: [],
                };
            }
    
            /** @type {DailyBreadData} */
            const dailyBread = snapshot.val();
    
            return fetch(`../bible/${dailyBread.bookName}.json`).then(data => data.json()).then((book) => {
                return /** @type {BibleChapter} */(book.chapters[dailyBread.chapterIdx]);
            })
        }).then((chapter) => {
            const versesHTML = chapter.verses.map(verse => `
                <p class="daily-bread-widget__verse">
                    <span class="daily-bread-widget__verse__ref">${verse.ref}</span>
                    <span class="daily-bread-widget__verse__text">${verse.text}</span>
                </p>
            `).join('');
    
            for (const widget of widgets) {
                for (const title of widget.querySelectorAll('.daily-bread-widget__chapter-title')) {
                    title.textContent = chapter.refLong;
                }
    
                for (const verseContainer of widget.querySelectorAll('.daily-bread-widget__verses')) {
                    verseContainer.innerHTML = versesHTML;
                }
    
                for (const expander of widget.querySelectorAll('.daily-bread-widget__expander')) {
                    expander.removeAttribute('disabled');
                    expander.classList.remove('button--disabled');
                    expander.addEventListener('click', () => {
                        widget.classList.add('daily-bread-widget--expanded');
                    });
                }
    
                widget.classList.add('daily-bread-widget--loaded');
                if (chapter.verses.length <= UNEXPANDED_LENGTH) {
                    widget.classList.add('daily-bread-widget--expanded');
                }
            }
        }).catch(() => {
            const div = document.createElement('div');
            div.classList.add('daily-bread-widget__errored');
            div.innerHTML = `
                <div>There was a problem getting today's Daily Bread.</div>
                <button class="button button--bg-primary button--text-lightest button--hover-shadow">Try again</button>
            `;
            
            for (const widget of widgets) {
                widget.classList.add('daily-bread-widget--errored');
    
                for (const title of widget.querySelectorAll('.daily-bread-widget__chapter-title')) {
                    title.textContent = 'An error occurred.';
                }

                for (const verseContainer of widget.querySelectorAll('.daily-bread-widget__verses')) {
                    verseContainer.textContent = '';

                    const clone = /** @type {HTMLDivElement} */(div.cloneNode(true));
                    const button = /** @type {HTMLButtonElement} */(clone.querySelector('button'));
                    button.addEventListener('click', fetchDailyBread);

                    verseContainer.appendChild(clone);
                }
            }
        }).finally(() => {
            for (const widget of widgets) {
                widget.classList.remove('daily-bread-widget--loading');
            }
        });
    };

    fetchDailyBread();
})();