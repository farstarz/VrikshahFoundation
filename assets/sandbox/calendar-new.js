$(document).ready(function() {
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

    var database = firebase.database();

    var eventsArray;
    
    $('#datetimepicker1').datetimepicker( {
        defaultDate: "2018-11-01"
    });

    //initialize calendar
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay, listYear'
        },
        views: {
            listYear: {
                type: 'list',
                visibleRange: function(currentDate) {
                    return {
                      start: currentDate.clone().subtract(1, 'months'),
                      end: currentDate.clone().add(3, 'months') // exclusive end, so 3
                    };
                },
                buttonText: 'List'
            }
        },   
        eventMouseover: function(calEvent, jsEvent, view){
            console.log("mouseover");
            console.log(jsEvent)
            console.log(view)
            $(this).attr("data-toggle", "tooltip");
            $(this).attr("data-placement", "right");
            $(this).attr("title", calEvent.description);
            $(this).tooltip("toggle")
        },
        eventClick: function(calEvent, jsEvent, view) {
            console.log("event click");
            console.log(calEvent.description); 
            console.log(calEvent.id);
            $("#event-title").text(calEvent.title)
            $("#start-time").text(calEvent.start)
            $("#description").text(calEvent.description)
            $("#myModal").modal('toggle')
        }
    });

    //function to locally save all events
    database.ref('events').once("value").then(function(snapshot){
        eventsArray = snapshot.val();
        console.log(snapshot.val())        
        var result = Object.keys(eventsArray).map(function(key) {
            return [Number(key), eventsArray[key]];
        });
        for (var i = 0; i < result.length; i++){
            result[i] = result[i][1];    
        }
        console.log(result);
        $("#calendar").fullCalendar('renderEvents', result, true)
    })
    /** Modal for Admin only to add new event */
    $("#admin-add-event-btn").on("click", function () {
        console.log("Open Create New Event Modal"); 
        $("#new-event-title").text("");
        $("#datetimepicker1").text("");
        $("#new-event-description").text("");
        $("#modal-btn").val("Add Event");
        $("#eventModal").attr("data-value", "Add-New-Event");
        $("#eventModal").modal('toggle');
    });

    $("#add-event-btn").on("click", function (){
       var title =  $("#new-event-title").val();
       var description = $("#new-event-description").val();
       var startDate =  $("#new-event-date").val();
       var startTime =  $("#new-event-time").val();
        $("#eventModal").modal('toggle');
        console.log("Title: " + title);
        console.log("Description: " + description);
        console.log("Start Date: " + startDate);
        console.log("Start time: " + startTime);
        var dateString = startDate + " " + startTime;
        console.log(dateString);
        var startTimeMoment = moment(dateString);
        console.log(startTimeMoment.utc());
        console.log(startTimeMoment.format("dddd, MMMM Do YYYY HH:mm"));
        var newEvent = {
            "title": title,
            "description": description,
            "start": startTimeMoment.format("YYYY-MM-DD HH:mm")
        };
        database.ref("events").push(newEvent);
    });

    $("#dont-add-event-btn").on("click", function (){
        $("#new-event-title").text("");
        $("#new-event-date").text("");
        $("#new-event-time").text("");
        $("#new-event-description").text("");
        $("#modal-btn").val("Add Event");
        $("#eventModal").attr("data-value", "Add-New-Event");
        $("#eventModal").modal('toggle');
    });
 
});
