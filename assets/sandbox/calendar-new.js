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

    /** This is where we need to add code to check for Admin permissions. */
    var admin = true;
    if (!admin) { 
        $("#admin-add-event-btn").remove();
        $("#edit-event-btn").remove();
    };

    firebase.initializeApp(config);

    var database = firebase.database();

    var eventsArray;

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
            $(this).attr("data-toggle", "tooltip");
            $(this).attr("data-placement", "right");
            $(this).attr("title", calEvent.description);
            $(this).tooltip("toggle")
        },
        eventClick: function(calEvent, jsEvent, view) {
            if (!admin) $("#edit-event-btn").hide();
            $("#event-title").text(calEvent.title);
            $("#start-time").text(calEvent.start);
            $("#end-time").text(calEvent.end);
            $("#description").text(calEvent.description);            
            $("#edit-event-btn").attr("data-value", calEvent.id);
            $("#edit-event-btn").attr("data-index", calEvent.index);
            $("#myModal").modal('toggle')
        }
    });

    /** function to locally save all events */
    database.ref('events').once("value").then(function(snapshot){
        eventsArray = snapshot.val();        
        var result = Object.keys(eventsArray).map(function(key) {
            return [key, eventsArray[key]];
        });
        for (var i = 0; i < result.length; i++){
            result[i][1].id = result[i][0];
            result[i] = result[i][1];
            result[i].start = moment(result[i].start).local();
            result[i].end = moment(result[i].end).local();
            result[i].index = i;
            
        }
        eventsArray = result;
        $("#calendar").fullCalendar('renderEvents', eventsArray, true)
    })


    /**** Admin functions for adding and editing events**/
    /** Modal for Admin only to add new event */
    $("#admin-add-event-btn").on("click", function () {
        $("#new-event-title").text("");
        $("#new-event-description").text("");
        $("#modal-btn").val("Add Event");
        $("#eventModal").attr("data-value", "Add-New-Event");
        $("#eventModal").modal('toggle');
    });

    /** Modal to Add new event to database brings up modal form. (Admin function only) */
    $("#add-event-btn").on("click", function (){
       var title =  $("#new-event-title").val();
       var description = $("#new-event-description").val();
       var startDate =  $("#new-event-date").val();
       var startTime =  $("#new-event-time").val();
       var endDate =  $("#new-event-end-date").val();
       var endTime =  $("#new-event-end-time").val();
        $("#eventModal").modal('toggle');     
        var dateString = startDate + " " + startTime;
        var startTimeMoment = moment(dateString);
        var endDateString = endDate + " " + endTime;
        var endTimeMoment = moment(endDateString);
        var newEvent = {
            "title": title,
            "description": description,
            "start": startTimeMoment.utc().format(),
            "end": endTimeMoment.utc().format()
        };
        var keypush = database.ref("events").push(newEvent)
        var key = keypush.getKey();
        $("#new-event-title").val("");
        $("#new-event-date").val("");
        $("#new-event-time").val("");
        $("#new-event-end-date").val("");
        $("#new-event-end-time").val("");
        $("#new-event-description").val("");
        var index = eventsArray.length;
        eventsArray.push(newEvent);
        eventsArray[index].index = index;
        eventsArray[index].id = key;
        eventsArray[index].start = moment(eventsArray[index].start).local();
        eventsArray[index].end = moment(eventsArray[index].end).local();
        $("#calendar").fullCalendar('removeEvents') 
        $("#calendar").fullCalendar('renderEvents', eventsArray, true)
    });

    /** Cancel button, closes out modal and clears form values   */
    $("#dont-add-event-btn").on("click", function (){
        closeAndClearEditModal();
    });

    /** Closes Modal and clears out old values in field. */
    function closeAndClearEditModal() {
        $("#new-event-title").text("");
        $("#new-event-date").text("");
        $("#new-event-time").text("");
        $("#new-event-description").text("");
        $("#modal-btn").val("Add Event");
        $("#eventModal").attr("data-value", "Add-New-Event");
        $("#eventModal").modal('toggle');
    }

    /** Modal for editing an existing event (Admin Function Only) */
    $("#edit-event-btn").on("click", function (){
        $("#myModal").modal('toggle');
        var id = $(this).data('value')        
        var eventObject = $("#calendar").fullCalendar( 'clientEvents', id)[0];        
        var title = eventObject.title;
        var description = eventObject.description;  
        var start = eventObject.start;
        var end = eventObject.end;
        $("#edit-event-title").val(title);
        $("#edit-event-description").val(description);
        $("#edit-event-title").val(title);
        $("#edit-event-date").val(start.format("MM/DD/YYYY"));
        $("#edit-event-time").val(start.format("hh:mm a"));
        // $("#edit-event-date").val(end.format("MM/DD/YYYY"));
        // $("#edit-event-time").val(end.format("hh:mm a"));
        $("#editEventModal").modal('toggle');
     });

     $("#submit-edit-event-btn").on("click", function(){
        var id = $("#edit-event-btn").data('value');
        var title =  $("#edit-event-title").val();
        var description = $("#edit-event-description").val();
        var startDate =  $("#edit-event-date").val();
        var startTime =  $("#edit-event-time").val();
        var endDate =  $("#edit-event-end-date").val();
        var endTime =  $("#edit-event-end-time").val();
        $("#editEventModal").modal('toggle');
        var dateString = startDate + " " + startTime;
        // 
        var startTimeMoment = moment(dateString);
        var endDateString = endDate + " " + endTime;        
        var endTimeMoment = moment(endDateString);
        var editEvent = {
            "title": title,
            "description": description,
            "start": startTimeMoment.utc().format(),
            "end": endTimeMoment.utc().format()
        };
        database.ref('events').child(id).update(editEvent);
        var index = $("#edit-event-btn").data('index');        
        eventsArray[index] = editEvent;
        eventsArray[index].id = id;
        eventsArray[index].index = index;
        eventsArray[index].start = moment(eventsArray[index].start).local();
        eventsArray[index].end = moment(eventsArray[index].end).local();
        $("#calendar").fullCalendar('removeEvents') 
        $("#calendar").fullCalendar('renderEvents', eventsArray, true) 
    });
  
  
});
