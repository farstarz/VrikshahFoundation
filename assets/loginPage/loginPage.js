var currentWindow = localStorage.getItem(currentWindowStorageName);
console.log(currentUser);

function verifyEntryPoint() {
    if (currentWindow === null) {
        window.location.replace("../../homePage.html");
    }
}
verifyEntryPoint();

// FirebaseUI config.
var uiConfig = {
    signInSuccessUrl: currentWindow,
    callbacks: {
        // Called when the user has been successfully signed in.
        signInSuccessWithAuthResult: function (authResult) {
            // Create user object.
            var user = new User(authResult.user.email, authResult.user.displayName, true, authResult.user.photoURL); 

            // Store user in local storage to allow other areas of our application to easily access user info.
            localStorage.setItem(currentUserStorageName, JSON.stringify(user));
            
            // Redirect on successful login.
            return true; 
        },
        
        // Called when the user failed to log in.
        signInFailure: function(error){
            // TODO: Need to handle error.
        }
    },
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,           
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