//enable google-cloud
//var gcloud = require("google-cloud");   

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// initialize moment.js for date functions
var moment = require('moment');
moment().format();

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
    createRole(newUser.email);
    return createUser(newUser);

    function User(email, name, notificationsOn, photoUrl) {
        this.email = email;
        this.name = name;
        this.notificationsOn = notificationsOn;
        this.photoUrl = photoUrl;
    }

    function createUser(user) {
        var usersRootObj = "users";
        var userId = encodeAsFirebaseKey(user.email);
        return admin.database().ref(usersRootObj).child(userId).set(user);
    }

    function createRole(email){
        var userRolesObj = "roles";
        var userId = encodeAsFirebaseKey(email);
        admin.database().ref(userRolesObj).child(userId).set(0);    
    } 

    function encodeAsFirebaseKey(string) {
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

exports.welcomeEmail = functions.database.ref('welcomeEmail/{welcomeID}').onCreate((snapshot, context) => {
  var http = require("http");

  var options = {
    "method": "POST",
    "hostname": "api.pepipost.com",
    "port": null,
    "path": "/v2/sendEmail",
    "headers": {
      "content-type": "application/json",
      "api_key": "4a313664cc518338f18fe8391519b10d"
    }
  };
  
  var req = http.request(options, function (res) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });

  req.write(JSON.stringify({ personalizations:  [{recipient:'mlhe@ucdavis.edu'},{recipient:'margaretful@gmail.com'}],
    from: { fromEmail: 'farstarz@pepisandbox.com', fromName: 'farstarz' },
    subject: 'Welcome to Pepipost',
    content: 'Hi, this email is getting sent to everyone who just signed up for Pepipost. Thank you again for signing up!' }));
  req.end();  

  return(0);
}); // end welcome Email func


//trigger time
var timeNow = moment();
var yyyy= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("YYYY");
var mm= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("MM");
var dd= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("DD");
// get the next day
dd = parseInt(dd)+1;

// Sends Email Notification Reminder to attendees 24 hours before event
exports.sendEmailNotification = functions.database.ref("/dates/"+yyyy+"/"+mm+"/"+dd).onWrite((snapshot, context)=> {    
  if (snapshot.after._data.testID == true) {     // if testID was changed (if today's date is 24 hours before an event)
    var eventIDArr = [];
    // begin send email function
    var o = snapshot.after._data;
    eventIDArr = Object.keys(o);                 // array holds all event IDs of events occuring tomorrow

    // remove testID from the event ID list (used only for trigger purposes)
    eventIDArr.splice(-1,1);
    
    // for each event occuring tomorrow, grab list of attendees
    eventIDArr.forEach((eventID)=>{
    // return callback
      return admin.database().ref('/attendees/' + eventID+'/').once('value', (snapshot) => {
        function encodeEmail(string) {	
          return string.replace(/\%2E/g, '.');
        }  

        // get users for each eventID
        if(snapshot){   // if snapshot exists
          var emailObj = snapshot.val();
          console.log(emailObj);
          
          var emailList = [];
          Object.keys(emailObj).forEach((email)=>{
            var notification = emailObj[email];
            if (notification == true){                // if user's notification setting is on
              emailList.push(email);
            } // end if notification
          });
          
          var i = 0;
          emailList.forEach((email)=>{
            emailList[i] = encodeEmail(email);
            i++;
          }); // end forEach in emailliST
          console.log(emailList);

          // create array of objects of {recipient: email}
          var emailObjArr = [];
          emailList.forEach((recipient)=>{    // emailList structure: ['mlhe@ucdavis.edu', 'vaibhav.pandey9890@gmail.com']  
            var recipientObj = {
              "recipient": recipient
            } // end recipientObj
            emailObjArr.push(recipientObj);
          }); // end for each recipient
          console.log(emailObjArr);


          // send email using pepipost API
          var http = require("http");

          var options = {
            "method": "POST",
            "hostname": "api.pepipost.com",
            "port": null,
            "path": "/v2/sendEmail",
            "headers": {
              "content-type": "application/json",
              "api_key": "4a313664cc518338f18fe8391519b10d"
            }
          };

          var req = http.request(options, function (res) {
            var chunks = [];
          
            res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            res.on("end", function () {
              var body = Buffer.concat(chunks);
              console.log(body.toString());
            });
          });

          // pass in emailObjArr to personalizations

          req.write(JSON.stringify({ personalizations: emailObjArr,
            from: { fromEmail: 'farstarz@pepisandbox.com', fromName: 'farstarz' },
            subject: 'Event Reminder Tomorrow',
            content: 'Hi, this email is getting sent to multiple people from an automated service, reminding you that the event you signed up for is occuring tomorrow at 3pm. Have a great day!' }));
          req.end();  
          snapshot.testID = false;
          return(0);
        }  // end if(snapshot)
      }); // end return
    });  // end forEach EventID
    return(0);
  } // end main if (testID == true)

  else {
    console.log('else statement executed because this particular event has no users signed up');
    return(0);
  }
    
}); 


