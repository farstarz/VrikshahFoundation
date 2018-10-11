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
            console.log(jsEvent)
            console.log(view)
            $(this).attr("data-toggle", "tooltip");
            $(this).attr("data-placement", "right");
            $(this).attr("title", calEvent.description);
            $(this).tooltip("toggle")
        },
        eventClick: function(calEvent, jsEvent, view) {
            console.log(calEvent.description); 
            console.log(calEvent.id);
            $("#event-title").text(calEvent.title)
            $("#start-time").text(calEvent.start)
            $("#description").text(calEvent.description)
            $("#myModal").modal('toggle')
            // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
            // alert('View: ' + view.name);
        }
    });
    $("#myModal").modal('toggle')
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
});
