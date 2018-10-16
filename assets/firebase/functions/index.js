//enable google-cloud
//var gcloud = require("google-cloud");   

const functions = require('firebase-functions');
const admin = require('firebase-admin');
// initialize moment.js for date functions
var moment = require('moment');
moment().format();


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

  req.write(JSON.stringify({ personalizations:  [{recipient:'mlhe@ucdavis.edu'},{recipient:'vaibhav.pandey9890@gmail.com'}],
    from: { fromEmail: 'farstarz@pepisandbox.com', fromName: 'farstarz' },
    subject: 'Welcome to Pepipost',
    content: 'Hi, this email is getting sent to multiple people TO MARGRATE and ILU THIS ONE' }));
  req.end();  
  return 0;

}); // end welcome Email func


//trigger time
var timeNow = moment();
console.log(timeNow);
var yyyy= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("YYYY");
var mm= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("MM");
var dd= moment(timeNow,"YYYY-MM-DDTHH:mm:ss.SSS").format("DD");
// get the next day
dd = parseInt(dd)+1;
console.log('year: '+yyyy+'month: '+mm+'day: '+dd);
console.log("before trigger");
exports.sendEmailNotification = functions.database.ref("/dates/"+yyyy+"/"+mm+"/"+dd).onWrite((snapshot, context)=> {
  // if testID was changed
  // console.log(snapshot);
  console.log(snapshot.after._data.testID);
  var eventIDArr =[];
  // if today's date is 24 hours before an event
  if (snapshot.after._data.testID == true) { 
    console.log("run send email function");
    console.log(snapshot._data);
    eventIDArr = snapshot._data;
    // remove testID from the event ID list
    eventIDArr.pop();
    console.log(eventIDArr);
    
    // send email function
  //   var http = require("http");

  //   var options = {
  //     "method": "POST",
  //     "hostname": "api.pepipost.com",
  //     "port": null,
  //     "path": "/v2/sendEmail",
  //     "headers": {
  //       "content-type": "application/json",
  //       "api_key": "4a313664cc518338f18fe8391519b10d"
  //     }
  //   };

  //   var req = http.request(options, function (res) {
  //     var chunks = [];
    
  //     res.on("data", function (chunk) {
  //       chunks.push(chunk);
  //     });
    
  //     res.on("end", function () {
  //       var body = Buffer.concat(chunks);
  //       console.log(body.toString());
  //     });
  //   });

  //   req.write(JSON.stringify({ personalizations:  [{recipient:'mlhe@ucdavis.edu'},{recipient:'vaibhav.pandey9890@gmail.com'}],
  //     from: { fromEmail: 'farstarz@pepisandbox.com', fromName: 'farstarz' },
  //     subject: 'Welcome to Pepipost',
  //     content: 'Hi, this email is getting sent to multiple people TO MARGRATE and ILU THIS ONE' }));
  //   req.end();  
  //   return 0;
    console.log(snapshot);
    snapshot.testID = false;
  }

  else {
    console.log('you have an error in your code :(');
  }
    return(0);
}); 



    // get emails from firebase
        // create a trigger at a certain time
        // check today's data and store year month and date in variables

        // in firebase check for corresponding year, corresponding month and corresponding date
        // if snapshot exists, store the eventIDs in a array     *
      // create array of emails for notification
        // for each eventID, go to eventAttendees collection
        // parse through all users, for every user with notification ON add userID to an array <lc>
          // of objects with key set to recipient
          //  for (var i =0; i<oldarray.length; i++){
          //    newarray[i] = `{recipient:`+oldarray[i]+`}`;
          //  }
        // pass this array to sendEmail function
    
    // input this array as parameter in the sendEmail function





//   return 0;
// });

// get date and time
// var today = new Date();
// today -= "0000-00-00T07:00:00.000Z";
// var dd = today.getDate();
// var mm = today.getMonth()+1;
// var yyyy = today.getFullYear();
// console.log(mm+'/'+dd+'/'+yyyy);


// WRITE PSEUDOCODE FOR WELCOME EMAIL



