import { fetchDailyBread } from "./dailybread.js";
import { fetchMorningRevival } from "./morningrevival.js";

// Daily Bread button bar
const daysOfWeek = ["Mo", "Tu", "Wed", "Th", "Fr", "Sat", "Sun"];
const scrollBar = document.getElementById("daily-scroll-bar");

const today = new Date();
const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // JS Sunday=0, shift to 6

// Generate buttons
daysOfWeek.forEach((day, idx) => {
  const btn = document.createElement("button");
  btn.textContent = day;
  btn.disabled = idx > currentDayIndex; // Only enable past/current days
  if (idx === currentDayIndex) btn.classList.add("selected");

  btn.addEventListener("click", () => {
    document.querySelectorAll("#daily-scroll-bar button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    fetchDailyBread(idx); // pass day index
    fetchMorningRevival(idx)
  });

  scrollBar.appendChild(btn);
});

fetchDailyBread(currentDayIndex)
fetchMorningRevival(currentDayIndex)
