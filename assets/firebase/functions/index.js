const functions = require('firebase-functions');

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
