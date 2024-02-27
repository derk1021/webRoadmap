// ICON MAP CODE
export const ICON_MAP = new Map();

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
