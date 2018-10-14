var currentWindow = localStorage.getItem(currentWindowStorageName);

function verifyEntryPoint() {
    if (currentWindow === null) {
        window.location.replace("../../homePage.html");
    }
}
verifyEntryPoint();
console.log(currentWindow);

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