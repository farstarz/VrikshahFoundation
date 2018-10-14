var currentWindow = localStorage.getItem(currentWindowVar);

// FirebaseUI config.
var uiConfig = {
    signInSuccessUrl: currentWindow,
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,                
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    // tosUrl and privacyPolicyUrl accept either url string or a callback
    // function.
    // Terms of service url/callback.
    tosUrl: '<your-tos-url>',
    // Privacy policy url/callback.
    privacyPolicyUrl: function () {
        // TODO: Privacy callback
        window.location.assign('<your-privacy-policy-url>');
    }
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#loginPanel', uiConfig);


firebase.auth().onAuthStateChanged(async user => {

    // Check if user if logged in.
    if (user){                
        // 
        var userExits = await firebaseDB.userExists(user.email);
        if (userExits){
            currentUser = await firebaseDB.getUser(user.email);
            updateUI(currentUser);
        } else {
            // If we fail to create the user in our database, log the user out.
            logoutUser();

            // TODO: We'll need to tell the user that something when wrong when creating their user profile.
        }
    }
    else{
        // Reset global user to null.
        currentUser = null;
        updateUI(user);
    }
});

function updateUI(userLoggedIn){
    if (userLoggedIn){
        console.log("Update UI To show User Stuff");
        // Show all user ui stuff

        // Depending on their role...we'll update the UI appropiately.

    }
    else {
        console.log("Update UI To hide User Stuff");
        // hide user UI stuff
    }
}

$("#logOutLink").on('click', function(){
    logoutUser();
    console.log("User has been logged out");
})

function logoutUser(){
    firebase.auth().signOut();
}