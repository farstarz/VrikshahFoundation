// Globals
var currentUser = null; // If left null, no user is logged in.
var currentUserRole = null;
var currentUserStorageName = "currentUser";
var currentUserRoleStorageName = "currentUserRole";
var currentWindowStorageName = "currentWindow";

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

// User Constructor
function User(email, name, notificationsOn, photoUrl) {
    this.email = email;
    this.name = name;
    this.notificationsOn = notificationsOn;
    this.photoUrl = photoUrl;
}

// Event Constructor
function Event(date, description) {
    this.date = date;
    this.description  = description;
}

var firebaseDB = {

    DB: firebase.database(),

    // Database root objects
    usersEventsRootObj: "userEvents",
    usersRootObj: "users",
    attendeesRootObj: "attendees",
    eventsRootObj: "events",
    userRolesRootObj: "roles",
    errorLogRootObj: "errors",

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

    createEvent: function(eventId, event){
        this.DB.ref(this.eventsRootObj).child(eventId).set(event).catch(function(error){
            alert('Failed to create event');
            firebaseDB.logError(error);
        });
    },

    registerUserForEvent: function(email, eventId, reminderOn){
        var userId = this.encodeAsFirebaseKey(email);
        // Events that the user is registered for are stored as an object with the following format:
        // { eventId: true }
        // This give us the ability to avoid duplicate events and a quick way to check if a user is 
        // registered for a particular event.
        this.DB.ref(this.usersEventsRootObj).child(userId).child(eventId).set(true).catch(function(error){
            alert('Failed to register the user for the event');
            firebaseDB.logError(error);
        });
        
        // Add user to list of event attendees.        
        this.DB.ref(this.attendeesRootObj).child(eventId).child(userId).set(reminderOn).catch(function(error){
            alert('Failed to add user to list of event attendees');
            firebaseDB.logError(error);
        });
    },

    getUser: async function(email){
        var userId = this.encodeAsFirebaseKey(email);
        var user = await this.DB.ref(this.usersRootObj).child(userId).once('value').catch(function(error){
            firebaseDB.logError(error);
        });
        return user.val();
    },

    getUserRole: async function(email){
        var userId = this.encodeAsFirebaseKey(email);
        var user = await this.DB.ref(this.userRolesRootObj).child(userId).once('value').catch(function(error){
            firebaseDB.logError(error);
        });
        return user.val();
    },

    userExists: async function(email){
        return await this.getUser(email) !== null;
    },

    getUserEvents: async function(email){
        var userId = this.encodeAsFirebaseKey(email);
        var userEvents = await this.DB.ref(this.usersEventsRootObj).child(userId).once('value').catch(function(error){
            firebaseDB.logError(error);
        });
        // Returns null if user has not registered for any events.
        return await userEvents.val() === null ? null: Object.keys(userEvents.val());
    },

    isUserRegisteredForEvent: async function(email, eventId){
        var userId = this.encodeAsFirebaseKey(email);
        var event = await this.DB.ref(this.usersEventsRootObj).child(userId).child(eventId).once('value').catch(function(error){
            firebaseDB.logError(error);
        });
        return event.val() !== null;
    },

    logError: function(error){
        // This function needs to ref the DB object directly and cannot use 'this'
        // since it's intended to be called by a promise catch method.
        var currentDateTime = new Date();
        firebase.database().ref(firebaseDB.errorLogRootObj).push({
            timestamp: currentDateTime.toString(),
            error: error,
        });
    }
}

// Initialize the page.
async function pageInit(){
    currentUser = JSON.parse(localStorage.getItem(currentUserStorageName));
    
    // Check if user is logged in.
    if (currentUser){

        // Get user role.
        currentUserRole = localStorage.getItem(currentUserRoleStorageName);
        if (currentUserRole === null){
            currentUserRole = await firebaseDB.getUserRole(currentUser.email);            
            localStorage.setItem(currentUserRoleStorageName, currentUserRole);
        } else {
            currentUserRole = parseInt(currentUserRole);
        }

        // UI needs to be updated accordingly if user is logged in.
        updateUI(currentUser, currentUserRole);
    }

    // Current window ref needs to be cleared for all pages excluding the login page.
    if (!window.location.href.toString().toLowerCase().includes("loginpage")){
        localStorage.removeItem(currentWindowStorageName);
    }
}
pageInit();

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

// Used to return the user back to the original page they were on before 
// logging in.

$("#loginBtn").on('click', function(){
    localStorage.setItem(currentWindowStorageName, window.location.href);
});

function updateUI(userLoggedIn, userRole) {
    if (userLoggedIn) {
        console.log("Update UI To show User Stuff");
        // Show all user ui stuff
        $(".userProfile").css({
            "display": "inline-block",
            "width": "45px",
            "background-image": "url("+ currentUser.photoUrl+ ")"
        })
        $("#loginBtn").css({
            "display": "none",
           
        })
        $("#dropdownCaret").css({
            "display": "inline-block",
            "margin-right": "50px"
            
        })
        // Depending on their role...we'll update the UI appropiately.

    } else {
        console.log("Update UI To hide User Stuff");
        $(".userProfile").css({
            "display": "none",
           
        })
       
        $("#loginBtn").css({
            "display": "block"
        })
    
        // hide user UI stuff
    }
}

// TODO: Jake, you'll need to clean this up.
$("#logOutLink").on('click', function () {
    logoutUser();
    console.log("User has been logged out");
})

function logoutUser() {
    currentUser = null;
    updateUI(false);
    firebase.auth().signOut();
    localStorage.removeItem(currentUserStorageName);
    localStorage.removeItem(currentUserRoleStorageName);
}



// code of sending email notifications at 6AM day before the events
// get time at hour 

var timeWeWant = moment({ hour:21, minute:18 });
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

