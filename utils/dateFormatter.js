const moment = require('moment-timezone');

function convertDatesToIST(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') return obj;

  // Avoid circular reference
  if (seen.has(obj)) return obj;
  seen.add(obj);

  if (obj instanceof Date) {
    return moment(obj).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToIST(item, seen));
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      newObj[key] = convertDatesToIST(obj[key], seen);
    }
  }

  return newObj;
}

module.exports = convertDatesToIST;
