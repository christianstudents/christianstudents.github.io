export interface DailyBreadData {
    bookName: string;
    chapterIdx: number;
    readCounts: number;
}

export interface BibleVerse {
    ref: string;
    refLong: string;
    text: string;
}

export interface BibleChapter {
    ref: string;
    refLong: string;
    numVerses: number;
    verses: BibleVerse[];
}

export interface BibleBook {
    ref: string;
    refLong: string;
    numChapters: number;
    chapters: BibleChapter[];
}