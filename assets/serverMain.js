
// Initialize Firebase
var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyDeDvTkvePDm7W3uut813oSYJ_tMi6kik4",
  authDomain: "vrikshahfoundation-afc36.firebaseapp.com",
  databaseURL: "https://vrikshahfoundation-afc36.firebaseio.com",
  projectId: "vrikshahfoundation-afc36",
  storageBucket: "vrikshahfoundation-afc36.appspot.com",
  messagingSenderId: "846836131515"
};
firebase.initializeApp(config);

// initialize moment.js for date functions
var moment = require('moment');
moment().format();

// initialize firebase database
var firebaseDB = {

  DB: firebase.database(),

  encodeAsFirebaseKey: function(string){
      // Used to encode an email into a valid Firebase key.
      // This key will be used to quickly query for existing users using their emails.
      return string.replace(/\%/g, '%25')
      .replace(/\./g, '%2E')
      .replace(/\#/g, '%23')
      .replace(/\$/g, '%24')
      .replace(/\//g, '%2F')
      .replace(/\[/g, '%5B')
      .replace(/\]/g, '%5D');    
  }
}

// code of sending email notifications at 6AM day before the events
// get time at hour 

var timeWeWant = moment({ hour:01, minute:01 });
var timeNow = moment();
var offsetMillis = timeWeWant - timeNow;
console.log(offsetMillis);
setTimeout(preTriggerSendEmail, offsetMillis);

// pretrigger function changes value of testID to true which triggers sendEmailNotification cloud function
var timeNow = moment();
console.log(timeNow);
var yyyy= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("YYYY");
var mm= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("MM");
var dd= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("DD");
dd = parseInt(dd)+1;
console.log(dd);
function preTriggerSendEmail() {   //pretrigger with a dummy testID
    firebaseDB.DB.ref(`/dates/${yyyy}/${mm}/${dd}`).once("value").then((snapshot)=>{
        // change testID to true to trigger the firebase sendEmailNotification function
        snapshot.ref.update({"testID":true});
        // reinitialize testID for the next run
        snapshot.ref.update({"testID":false});
        var ID = "testID";
        console.log(snapshot.val());
        return(0);
    });
}

