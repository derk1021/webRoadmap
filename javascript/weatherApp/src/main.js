import { ICON_MAP } from "./icons.js";
import getWeather from "./weather.js";

const currTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
getWeather(10, 10, currTimeZone)
  .then((res) => {
    const { current, daily, hourly } = res;
    // console.log(current);
    renderCurrent(current);
    renderDaily(daily);
    renderHourly(hourly);
    document.getElementById("manage-blur").classList.remove("blurred");
  })
  .catch((err) => {
    console.log(err);
  });

// MAIN CODE
function setValue(attribute, value, parent = document) {
  parent.querySelector(`[data-${attribute}]`).textContent = value;
}

function getIconPath(code) {
  return `../public/icons/${ICON_MAP.get(code)}.svg`;
}

function renderCurrent(current) {
  // Render current weather
  const currentIcon = document.querySelector("[data-current-icon]");
  currentIcon.src = getIconPath(current.iconCode);
  console.log(currentIcon.src);
  setValue("current-temp", current.currentTemp);
  setValue("current-high", current.highTemp);
  setValue("current-low", current.lowTemp);
  setValue("current-fl-high", current.highFeelsLike);
  setValue("current-fl-low", current.lowFeelsLike);
  setValue("current-wind", current.windSpeed);
  setValue("current-precip", current.precip);
  return;
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" }); // Can change "long" -> "short"
function renderDaily(daily) {
  // Render daily weather
  const daySection = document.querySelector("[data-day-section]");
  const dayCard = document.getElementById("day-card-template");

  daySection.innerHTML = "";
  daily.forEach((day) => {
    // Clone the template for the day card
    const dayCardClone = dayCard.content.cloneNode(true);
    setValue("temp", day.maxTemp, dayCardClone);
    setValue("date", DAY_FORMATTER.format(day.timestamp), dayCardClone);
    const dayIcon = dayCardClone.querySelector("[data-icon]");
    dayIcon.src = getIconPath(day.weather_code);
    daySection.append(dayCardClone);
  });
  return;
}

const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
});
function renderHourly(hourly) {
  // Render hourly weather
  const hourSection = document.querySelector("[data-hour-section]");
  const hourRow = document.getElementById("hour-row-template");
  hourSection.innerHTML = "";
  hourly.forEach((hour) => {
    const hourRowClone = hourRow.content.cloneNode(true);
    setValue("day", DAY_FORMATTER.format(hour.timestamp), hourRowClone);
    setValue("time", HOUR_FORMATTER.format(hour.timestamp), hourRowClone);
    const hourlyIcon = hourRowClone.querySelector("[data-icon]");
    hourlyIcon.src = getIconPath(hour.iconCode);
    setValue("temp", hour.temp, hourRowClone);
    setValue("fl-temp", hour.feelsLikeTemp, hourRowClone);
    setValue("wind", hour.windSpeed, hourRowClone);
    setValue("precip", hour.precip, hourRowClone);
    hourSection.append(hourRowClone);
  });

  return;
}
