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
export default function getWeather(lat, lon, tz) {
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
