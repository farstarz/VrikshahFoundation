const express = require('express');
const app = express();
const port = 3000;


// Initialize Firebase
// var firebase = require('firebase');

// var config = {
//     apiKey: "AIzaSyDeDvTkvePDm7W3uut813oSYJ_tMi6kik4",
//     authDomain: "vrikshahfoundation-afc36.firebaseapp.com",
//     databaseURL: "https://vrikshahfoundation-afc36.firebaseio.com",
//     projectId: "vrikshahfoundation-afc36",
//     storageBucket: "vrikshahfoundation-afc36.appspot.com",
//     messagingSenderId: "846836131515"
// };
// firebase.initializeApp(config);
// var ref = firebase.app().database().ref('events');
// var events;
// ref.once('value')
//  .then(function (snap) {
//     data = snap.val();
//  });

app.use(express.static(__dirname));

//app.get('/', (req, res) => res.send('Hello World!'));
console.log(__dirname);
app.get('/', (req, res) => res.sendfile('homePage.html', { root: __dirname  } ));

// app.get('/events', (req, res) => {
//   res.send(data);
// });

// app.get('/events', (req, res) => {
//     var events;
    
//     res.send(events);
//   });


app.listen(port, () => console.log(`Example app listening on port ${port}!`));