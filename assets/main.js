// Initialize Firebase
var firebase = require('firebase');
// initialize moment.js for date functions
var moment = require('moment');
moment().format();

var config = {
    apiKey: "AIzaSyDeDvTkvePDm7W3uut813oSYJ_tMi6kik4",
    authDomain: "vrikshahfoundation-afc36.firebaseapp.com",
    databaseURL: "https://vrikshahfoundation-afc36.firebaseio.com",
    projectId: "vrikshahfoundation-afc36",
    storageBucket: "vrikshahfoundation-afc36.appspot.com",
    messagingSenderId: "846836131515"
};
firebase.initializeApp(config);

// Database root objects
var usersRootObj = "users";
var userEventsRootObj  = "userEvents";
var eventsRootObj = "events";
var attendeesRootObj = "attendees";

// User Constructor
function User(email, name, notificationsOn) {
    this.email = email;
    this.name = name;
    this.notificationsOn = notificationsOn;
}

// Event Constructor
function Event(date, description) {
    this.date = date;
    this.description  = description;
}

var firebaseDB = {

    // TODO: 
    // 1. Need to add error handling for database transactions.
    // 2. Need to add firebase functions for user on create and on delete triggers.

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
    },

    createUser: function(user){
        var userId = this.encodeAsFirebaseKey(user.email);        
        this.DB.ref(usersRootObj).child(userId).set(user);  
    },

    createEvent: function(eventId, event){
        this.DB.ref(eventsRootObj).child(eventId).set(event);
    },

    registerUserForEvent: function(email, eventId){
        var userId = this.encodeAsFirebaseKey(email);
        // Events that the user is registered for are stored as an object with the following format:
        // { eventId: true }
        // This give us the ability to avoid duplicate events and a quick way to check if a user is 
        // registered for a particular event.
        this.DB.ref(userEventsRootObj).child(userId).child(eventId).set(true);        
    },

    getUser: async function(email){
        var userId = this.encodeAsFirebaseKey(email);
        var user = await this.DB.ref(usersRootObj).child(userId).once('value');
        return user.val();
    },

    userExists: async function(email){
        return await this.getUser(email) !== null;
    },

    getUserEvents: async function(email){
        var userId = this.encodeAsFirebaseKey(email);
        var userEvents = await this.DB.ref(userEventsRootObj).child(userId).once('value');
        // Returns null if user has not registered for any events.
        return await userEvents.val() === null ? null: Object.keys(userEvents.val());
    },

    isUserRegisteredForEvent: async function(email, eventId){
        var userId = this.encodeAsFirebaseKey(email);
        var event = await this.DB.ref(userEventsRootObj).child(userId).child(eventId).once('value');
        return event.val() !== null;
    }
}

async function isValidEmail(email) {
    // Verify email using the Pozzad Email Validator API.
    var queryURL = "https://pozzad-email-validator.p.mashape.com/emailvalidator/validateEmail/" + email;

    var response = await $.ajax({
        url: queryURL,
        method: "GET",
        beforeSend: function (request) {
            request.setRequestHeader("X-Mashape-Key", "G8ckZ7n7HqmshP0sQEMeZXOFnUFlp1wqRrbjsn12wSBphCe8Jb");
        }
    });
    return response.isValid;
}


// code of sending email notifications at 6AM day before the events
// get time at hour 


var timeWeWant = moment({ hour:19, minute:49 });
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
    firebaseDB.DB.ref(`/dates/${yyyy}/${mm}/${dd}/eventID`).once("value").then((snapshot)=>{
        // change testID to true to trigger the firebase sendEmailNotification function
        snapshot.ref.update({"testID":true});
        // reinitialize testID for the next run
        snapshot.ref.update({"testID":false});
        var ID = "testID";
        console.log(snapshot.val());
        return(0);
    });
}

// preTriggerSendEmail();