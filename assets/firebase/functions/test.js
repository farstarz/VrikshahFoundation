// initialize moment.js for date functions
var moment = require('moment-timezone');
var timeNow = moment().tz('Asia/Colombo').format();
var yyyy= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("YYYY");
var mm= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("MM");
var dd= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("DD");
// get the next day
dd = parseInt(dd)+1;

console.log(timeNow);
moment.tz.names();