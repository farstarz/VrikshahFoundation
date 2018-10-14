const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


exports.example = functions.database.ref('testing/{testId}').onCreate((snapshot, context) => {
    const id = context.params.testId;
    console.log("ID: " + id);
    const original = snapshot.val();
    console.log("WTF: " + original);
    const uppercase = original.toUpperCase();

    return snapshot.ref.update( { id: uppercase});
});

exports.createUser = functions.auth.user().onCreate((user) => {
    
    var newUser = new User(user.email, user.displayName, true, user.photoURL);
    return createUser(newUser);

    function User(email, name, notificationsOn, photoUrl) {
        this.email = email;
        this.name = name;
        this.notificationsOn = notificationsOn;
        this.photoUrl = photoUrl;
    }

    function createUser(user){
        var usersRootObj = "users";
        var userId = encodeAsFirebaseKey(user.email);

        return admin.database().ref(usersRootObj).child(userId).set(user);  
    }

    function encodeAsFirebaseKey(string){
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
  });
