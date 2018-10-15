// Globals
var currentUser = null; // If left null, no user is logged in.
var currentUserStorageName = "currentUser";
var currentWindowStorageName = "currentWindow";

// Set the global logged in user.
function getLoggedInUser(){
    currentUser = JSON.parse(localStorage.getItem(currentUserStorageName));
}
getLoggedInUser();

// TODO: Jake, you'll now need to figure out a way to update the UI by checking if current user is not null.

// Initialize Firebase
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

// Used to return the user back to the original page they were on before 
// logging in.

$("#loginBtn").on('click', function(){
    localStorage.setItem(currentWindowStorageName, window.location.href);
});

// User Authentication state event listener.
// Gets triggered whenever the user logs in or out.
firebase.auth().onAuthStateChanged(async user => {
    
    // Check if user logged in and the state has not been saved to local storage.
    if (user && currentUser === null) {
        // Ensure that the user exits in our database.
        var userExits = await firebaseDB.userExists(user.email);
        if (userExits) {
            currentUser = await firebaseDB.getUser(user.email);
            localStorage.setItem(currentUserStorageName, JSON.stringify(currentUser));
            updateUI(currentUser);
        } else {
            // If we fail to create the user in our database, log the user out.
            logoutUser();

            // TODO: We'll need to tell the user that something when wrong when creating their user profile.
        }
    } 
});

function updateUI(userLoggedIn) {
    if (userLoggedIn) {
        console.log("Update UI To show User Stuff");
        console.log("hello");
        // Show all user ui stuff
        $(".userProfile").css({
            "display": "inline-block",
            "background-image": "url("+ currentUser.photoUrl+ ")"
        })
        $("#loginBtn").css({
            "display": "none",
           
        })
        $("#dropdownCaret").css({
            "display": "block",
            "margin-right": "300px"
            
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
    updateUI(false);
    currentUser = null;
    firebase.auth().signOut();
    localStorage.removeItem(currentUserStorageName);
}
