const convertDatesToIST = require('../utils/dateFormatter');

function formatDateMiddleware(req, res, next) {
  const originalJson = res.json;
  res.json = function (data) {
    const formattedData = convertDatesToIST(data);
    return originalJson.call(this, formattedData);
  };
  next();
}

module.exports = formatDateMiddleware;
