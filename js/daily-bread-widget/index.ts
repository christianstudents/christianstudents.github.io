import { initFirebase } from '../firebase';
import { getDatabase, ref, get as getRef } from 'firebase/database';
import { localizedDateFormat } from './helpers';
import { BibleBook, DailyBreadData } from './types';
import './styles.scss';

/**
 * The widget base class name.
 */
const WIDGET_CLASS = 'daily-bread-widget';

// This constant should also be changes in /css/daily-bread-widget.scss.
const UNEXPANDED_LENGTH = 5;

const createWidgets = () => {
    'use strict';

    initFirebase();

    const db = getDatabase();
    const widgets = Array.from(document.getElementsByClassName(WIDGET_CLASS));

    // Set the date on each of the widgets.
    const now = new Date();
    const dailyBreadDate = `${now.getMonth() + 1}/${now.getDate().toString().padStart(2, '0')}`;
    for (const date of widgets.flatMap(container => Array.from(container.querySelectorAll(`.${WIDGET_CLASS}__date`)))) {
        date.textContent = dailyBreadDate;
    }

    const fetchDailyBread = () => {
        for (const widget of widgets) {
            widget.classList.add(`${WIDGET_CLASS}--loading`);
            widget.classList.remove(`${WIDGET_CLASS}--errored`);
            for (const title of Array.from(widget.querySelectorAll(`.${WIDGET_CLASS}__chapter-title`))) {
                title.textContent = 'Loading...';
            }
            for (const verseContainer of Array.from(widget.querySelectorAll(`.${WIDGET_CLASS}__verses`))) {
                verseContainer.innerHTML = '';
            }
        }

        getRef(ref(db, `dailyBread/${localizedDateFormat(now)}`)).then((snapshot) => {
            if (!snapshot.exists()) {
                return {
                    ref: 'No Daily Bread today :(',
                    refLong: 'No Daily Bread today :(',
                    numVerses: 0,
                    verses: [],
                };
            }
    
            const dailyBread: DailyBreadData = snapshot.val();
    
            return (
                fetch(`../assets/bible/${dailyBread.bookName}.json`)
                    .then(data => data.json())
                    .then((book: BibleBook) => book.chapters[dailyBread.chapterIdx])
            );
        }).then((chapter) => {
            const versesHTML = chapter.verses.map(verse => `
                <p class="${WIDGET_CLASS}__verse">
                    <span class="${WIDGET_CLASS}__verse__ref">${verse.ref}</span>
                    <span class="${WIDGET_CLASS}__verse__text">${verse.text}</span>
                </p>
            `).join('');
    
            for (const widget of widgets) {
                for (const title of Array.from(widget.querySelectorAll(`.${WIDGET_CLASS}__chapter-title`))) {
                    title.textContent = chapter.refLong;
                }

                for (const verseContainer of Array.from(widget.querySelectorAll(`.${WIDGET_CLASS}__verses`))) {
                    verseContainer.innerHTML = versesHTML;
                }

                for (const expander of Array.from(widget.querySelectorAll(`.${WIDGET_CLASS}__expander`))) {
                    expander.removeAttribute('disabled');
                    expander.classList.remove('button--disabled');
                    expander.addEventListener('click', () => {
                        widget.classList.add(`${WIDGET_CLASS}--expanded`);
                    });
                }
    
                widget.classList.add(`${WIDGET_CLASS}--loaded`);
                if (chapter.verses.length <= UNEXPANDED_LENGTH) {
                    widget.classList.add(`${WIDGET_CLASS}--expanded`);
                }
            }
        }).catch(() => {
            const div = document.createElement('div');
            div.classList.add(`${WIDGET_CLASS}__errored`);
            div.innerHTML = `
                <div>There was a problem getting today's Daily Bread.</div>
                <button class="button button--bg-primary button--text-lightest button--hover-shadow">Try again</button>
            `;
            
            for (const widget of widgets) {
                widget.classList.add(`${WIDGET_CLASS}--errored`);
    
                for (const title of Array.from(widget.querySelectorAll(`.${WIDGET_CLASS}__chapter-title`))) {
                    title.textContent = 'An error occurred.';
                }

                for (const verseContainer of Array.from(widget.querySelectorAll(`.${WIDGET_CLASS}__verses`))) {
                    verseContainer.textContent = '';

                    const clone = div.cloneNode(true) as HTMLDivElement;
                    const button = clone.querySelector('button')!;
                    button.addEventListener('click', fetchDailyBread);

                    verseContainer.appendChild(clone);
                }
            }
        }).finally(() => {
            for (const widget of widgets) {
                widget.classList.remove(`${WIDGET_CLASS}--loading`);
            }
        });
    };

    fetchDailyBread();
};

export default createWidgets;
