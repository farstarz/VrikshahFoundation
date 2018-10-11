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
    var currentYear = new Date().getFullYear(); 
    var currentMonth = new Date().getMonth() + 1; //+1 because .getMonth() is index 0
    var prevYear;   //refers to year of prevMonth
    var prevMonth;
    var nextYear;   //refers to year of nextMonth
    var nextMonth;
    updateCurrent();    //initializes prev and next dates
    var eventsArrayCurrent = [];    //arrays to hold events for the currently viewed month
    var eventsArrayNext = [];
    var eventsArrayPrev = [];
    var view = "month"; //defines the current calendar view

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
        // defaultView: 'listWeek',
        eventClick: function(calEvent, jsEvent, view) {
            console.log(calEvent.title); 
            console.log(calEvent);
            // alert('Event: ' + calEvent.title);
            // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
            // alert('View: ' + view.name);
        }
    });

    //functions to update date variables
    function updateCurrent(dir){    //accepts direction argument, if needed
        if (dir == "next"){ //goes to next calendar month, shifts 
            currentMonth++; 
            if (currentMonth == 13){
                currentMonth = 1;
                currentYear++;
            }
            eventsArrayPrev = eventsArrayCurrent;
            eventsArrayCurrent = eventsArrayNext;
        }else if (dir == "prev"){
            currentMonth--;
            if (currentMonth == 0){
                currentMonth = 12;
                currentYear--;
            }
            eventsArrayPrev = eventsArrayCurrent;
            eventsArrayCurrent = eventsArrayNext;
        }
        updatePrev();
        updateNext();
    }
    function updatePrev() {
        prevYear = currentYear;
        prevMonth = currentMonth - 1;     
        if (prevMonth == 0) {
            prevMonth = 12;
            prevYear--;
        }
        console.log(prevMonth)
    }
    function updateNext() {
        nextYear = currentYear;
        nextMonth = currentMonth + 1;
        if (nextMonth == 13) {
            nextMonth = 1;
            nextYear++;
        }
        console.log(nextMonth)
    }

    //
    function populateCalendar(year, month, array){
        database.ref('dates/'+year+'/'+month).once("value").then(function(snapshot){
            array = snapshot.val();
            if (array != null){
                database.ref('events').once("value").then(function(snapshot2){
                    for(i=0; i<array.length; i++){
                        array[i]=snapshot2.val()[array[i]];
                    }
                    $("#calendar").fullCalendar('renderEvents', array);
                })
            }
        });
                
    };
    function populate() {
        populateCalendar(currentYear, currentMonth, eventsArrayCurrent);
        populateCalendar(nextYear, nextMonth, eventsArrayNext);
        populateCalendar(prevYear, prevMonth, eventsArrayPrev);
    }
    populate();

    $(document).on("click",".fc-prev-button", function(){
        if (view == "month") {
            updateCurrent("prev");
            populate()
            console.log(currentMonth + '-'+currentYear);
            console.log(nextMonth + '-'+nextYear);
            console.log(prevMonth + '-'+prevYear);
        } else if (view == "list") {
            currentMonth = 1;
            currentYear--;
            for (var i = 01; i<13; i++){
                populateCalendar(currentYear, i, eventsArrayCurrent);
            }
        }
    })
    $(document).on("click",".fc-next-button", function(){
        if (view == "month"){            
            updateCurrent("next");
            populate()
            console.log(currentMonth + '-'+currentYear);
        } else if (view == "week") {
            var currentDate = $(".fc-sun").attr("data-date"); //date for start of the week, YYYY-MM-DD            
            if (currentDate.charAt(6) != currentMonth%10){
                currentMonth++;
                console.log(currentMonth)
                if (currentMonth==13){
                    currentMonth = 1;
                    currentYear++;                    
                }
                updateCurrent();
                populate();
            }
        }else if (view == "list") {
            currentMonth = 1;
            currentYear++;
            updateCurrent();
            for (var i = 12; i>0; i--){
                populateCalendar(currentYear, i, eventsArrayCurrent);
            }            
        }
    })

    $(".fc-today-button").on("click", function(){        
        currentYear = new Date().getFullYear();
        currentMonth = new Date().getMonth() + 1;
        updateCurrent();
        populate();
    })
   $(document).on("click",'.fc-month-button', function(){
        view = "month"
    })
    $(document).on("click",'.fc-agendaWeek-button', function(){
        view = "week"
    })
    $(document).on("click",'.fc-agendaDay-button', function(){
        view = "day"
    })
    $(document).on("click",'.fc-listYear-button', function(){
        view = "list"
        for (var i = 01; i<13; i++){
            populateCalendar(currentYear, i, eventsArrayCurrent);
        }
    })
});
