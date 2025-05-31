// utils/timeChecker.js

/**
 * Convert "HH:mm" string to minutes since midnight
 */
function timeStringToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if the given Date object is within the allowed punch-in and punch-out range
 * @param {Date} date - Current Date (in IST if needed)
 * @param {string} punchInStr - e.g. "09:00"
 * @param {string} punchOutStr - e.g. "19:00"
 * @returns {{ allowed: boolean, reason?: string }}
 */
function checkLoginTime(date, punchInStr, punchOutStr) {
  const punchInMinutes = timeStringToMinutes(punchInStr);
  const punchOutMinutes = timeStringToMinutes(punchOutStr);
  const currentMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
    console.log("Current Minutes:", " ",date," ",currentMinutes, date.getUTCHours() , date.getUTCMinutes());
  console.log("Punch In Minutes:", punchInMinutes); 
    console.log("Punch Out Minutes:", punchOutMinutes);
  if (currentMinutes < punchInMinutes) {
    return {
      allowed: false,
      reason: `Login not allowed before ${punchInStr}`,
    };
  }

  if (currentMinutes > punchOutMinutes) {
    return {
      allowed: false,
      reason: `Login not allowed after ${punchOutStr}`,
    };
  }

  return { allowed: true };
}

module.exports = {
  checkLoginTime,
};
