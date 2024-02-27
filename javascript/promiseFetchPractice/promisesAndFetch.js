// import axios from "axios";
/* Format for website URL: 
- Protocol: https://
- Domain name: www.example.com
- Path: /page
- Query parameters: ?key=value
- URL format: [protocol][domain name][path][query parameters]

Original API: https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FLos_Angeles
Trimmed API: https://api.open-meteo.com/v1/forecast?current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime
- We are "trimming" it because we will define our own query paramters for latitude, longitude, and timezone
*/

// WEATHER CODE
const currTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
function getWeather(lat, lon, tz) {
  URL =
    "https://api.open-meteo.com/v1/forecast?current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime";
  return axios
    .get(URL, {
      params: {
        latitude: lat,
        longitude: lon,
        timezone: tz,
      },
    })
    .then(({ data }) => {
      return {
        current: parseCurrentWeather(data),
        daily: parseDailyWeather(data),
        hourly: parseHourlyWeather(data),
      };
    });
}

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

function parseCurrentWeather({ current, daily }) {
  const {
    temperature_2m: currentTemp,
    wind_speed_10m: windSpeed,
    weather_code: iconCode,
  } = current;

  const {
    apparent_temperature_max: [feelsLikeMax, ,], // appMaxTmp = daily.apparent_temperature_max[0]
    apparent_temperature_min: [feelsLikeMin, ,],
    precipitation_sum: [precip, ,],
    temperature_2m_max: [maxTemp, ,],
    temperature_2m_min: [minTemp, ,],
  } = daily;

  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(maxTemp),
    lowTemp: Math.round(minTemp),
    highFeelsLike: Math.round(feelsLikeMax),
    lowFeelsLike: Math.round(feelsLikeMin),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode,
  };
}

function parseDailyWeather({ daily }) {
  const {
    temperature_2m_max: maxTemp,
    time: timestamp,
    weather_code: iconCode,
  } = daily;

  const dailyInfo = timestamp.map((time, index) => ({
    timestamp: time * 1000,
    maxTemp: Math.round(maxTemp[index]),
    weather_code: iconCode[index],
  }));

  return dailyInfo;

  // Code snippets below is the same function as above:

  // For-loop:
  // let dailyInfo = [];
  // for (let i = 0; i < timestamp.length; i++) {
  //   dailyInfo.push({
  //     timestamp: timestamp[i] * 1000,
  //     maxTemp: Math.round(maxTemp[i]),
  //     weather_code: iconCode[i],
  //   });
  // }

  // return dailyInfo;

  // For-each:
  // const dailyInfo = [];

  // timestamp.forEach((time, index) => {
  //   dailyInfo.push({
  //     timestamp: time * 1000,
  //     maxTemp: Math.round(maxTemp[index]),
  //     weather_code: iconCode[index],
  //   });
  // });

  // return dailyInfo;
}

function parseHourlyWeather({ current, hourly }) {
  const hourlyInfo = hourly.time.map((time, index) => {
    return {
      timestamp: time * 1000,
      iconCode: hourly.weather_code[index],
      windSpeed: Math.round(hourly.wind_speed_10m[index]),
      temp: Math.round(hourly.temperature_2m[index]),
      feelsLikeTemp: Math.round(hourly.apparent_temperature[index]),
      precip: Math.round(hourly.precipitation[index] * 100) / 100,
    };
  });

  const currInfo = hourlyInfo.filter(({ timestamp }) => {
    return timestamp >= current.time * 1000;
  });

  return currInfo;
  // Quicker way below to achieve the same as above:
  // return hourly.time
  //   .map((time, index) => {
  //     return {
  //       timestamp: time * 1000,
  //       iconCode: hourly.weather_code[index],
  //       windSpeed: Math.round(hourly.wind_speed_10m[index]),
  //       temp: Math.round(hourly.temperature_2m[index]),
  //       feelsLikeTemp: Math.round(hourly.apparent_temperature[index]),
  //       precip: Math.round(hourly.precipitation[index] * 100) / 100,
  //     };
  //   })
  //   .filter(({ timestamp }) => {
  //     return timestamp >= current.time * 1000;
  //   });
}

// ICON MAP CODE
const ICON_MAP = new Map();
setIconCodes([0, 1], "sun");
setIconCodes([2], "cloud-sun");
setIconCodes([3], "cloud");
setIconCodes([45, 48], "smog");
setIconCodes(
  [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
  "cloud-showers-heavy"
);
setIconCodes([71, 73, 75, 77, 85, 86], "snowflake");
setIconCodes([95, 96, 99], "cloud-bolt");
// console.log(ICON_MAP);

function setIconCodes(key, value) {
  key.forEach((code) => {
    ICON_MAP.set(code, value);
  });
}

// MAIN CODE
function setValue(attribute, value, parent = document) {
  parent.querySelector(`[data-${attribute}]`).textContent = value;
}

function getIconPath(code) {
  return `/public/icons/${ICON_MAP.get(code)}.svg`;
}

function renderCurrent(current) {
  // Render current weather
  const currentIcon = document.querySelector("[data-current-icon]");
  currentIcon.src = getIconPath(current.iconCode);
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
