 $(document).ready(function () {

    var admin = false;
    var activeEventId = null;

    // Check if user is logged in.
    if (currentUser !== null){
        toggleUserButtons();
        if (currentUserRole > 0){
            // Admin users have a role greater than zero.
            displayAdminButtons();
            admin = true;
        }
    }

    function toggleUserButtons(){
        // Toggles buttons that change the flow of user registration.
        // TODO: Update this once UI is finished.
    }

    function displayAdminButtons(){
        // Show admin buttons.
        $("#admin-add-event-btn").removeClass("d-none");
        $("#edit-event-btn").removeClass("d-none");
    }

    var eventsArray = [];
    var placeid;

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
                visibleRange: function (currentDate) {
                    return {
                        start: currentDate.clone().subtract(1, 'months'),
                        end: currentDate.clone().add(3, 'months') // exclusive end, so 3
                    };
                },
                buttonText: 'List'
            }
        },
        eventMouseover: function (calEvent, jsEvent, view) {
            $(this).attr("data-toggle", "tooltip");
            $(this).attr("data-placement", "right");
            $(this).attr("title", calEvent.description);
            $(this).tooltip("toggle")
        },
        eventClick: function (calEvent, jsEvent, view) {
            if (!admin) $("#edit-event-btn").hide();
            $("#event-title").text(calEvent.title);
            $("#start-time").text(calEvent.start);
            $("#start-time").text("Start time: " + $("#start-time").text());
            $("#end-time").text(calEvent.end);
            $("#end-time").text("End time: "+$("#end-time").text());
            $("#description").text(calEvent.description);
            $("#edit-event-btn").attr("data-value", calEvent.id);
            $("#edit-event-btn").attr("data-index", calEvent.index);            
            initMap(calEvent.placeid);
            placeid = calEvent.placeid;
            $("#myModal").modal('toggle')
            activeEventId = calEvent.id;
        }
    });

    /**function to initialize map */
    function initMap(id) {
        var request = {
            placeId: id,
            fields: ['geometry', 'formatted_address']
          };
          
          service = new google.maps.places.PlacesService(map);
          service.getDetails(request, callback);
          
          function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: place.geometry.location,
                    zoom: 15,
                    mapTypeId: 'roadmap'
                    
                  });
                  var infowindow = new google.maps.InfoWindow();

                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location
                  });
                  $("#address").text("Location: "+place.formatted_address);
                  google.maps.event.addListener(marker, 'click', function() {
                    infowindow.setContent('<div>' + place.formatted_address + '</div>');
                    infowindow.open(map, this); 
                  });
            }
          }
    }

      function initAutocomplete(type) {
        var map = new google.maps.Map(document.getElementById(type+"Map"), {
          center: {lat: 28.63576, lng: 77.22445},
          zoom: 15,
          mapTypeId: 'roadmap'
          
        });

        if (type=="edit"){
            var request = {
                placeId: placeid,
                fields: ['geometry', 'formatted_address']
              };
              service = new google.maps.places.PlacesService(map);
          service.getDetails(request, callback);
          
            function callback(place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    var infowindow = new google.maps.InfoWindow();
                    var marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.setContent('<div>' + place.formatted_address + '</div>');
                        infowindow.open(map, this); 
                    });
                }
            }
        }

        // Create the search box and link it to the UI element.
        var input = document.getElementById(type+'-pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));
            placeid = place.place_id;
            var infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(markers[0], 'click', function() {
                infowindow.setContent('<div>' + place.formatted_address + '</div>');
                infowindow.open(map, this); 
            });
            
            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });
      }

    /** function to locally save all events */
    firebaseDB.DB.ref('events').once("value").then(function (snapshot) {
        eventsArray = snapshot.val();
        var result = Object.keys(eventsArray).map(function (key) {
            return [key, eventsArray[key]];
        });
        for (var i = 0; i < result.length; i++) {
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
        $("#empty").hide();
        $("#add-col").show();
        $("#new-event-title").text("");
        $("#new-event-description").text("");
        $("#modal-btn").val("Add Event");
        $("#eventModal").attr("data-value", "Add-New-Event");
        initAutocomplete('new');
    });
    
    /** Modal to Add new event to database brings up modal form. (Admin function only) */
    $("#add-event-btn").on("click", function () {
        var title = $("#new-event-title").val();
        var description = $("#new-event-description").val();
        var startDate = $("#new-event-date").val();
        var startTime = $("#new-event-time").val();
        var endDate = $("#new-event-end-date").val();
        var endTime = $("#new-event-end-time").val();
        $("#empty").show();
        $("#add-col").hide();
        var dateString = startDate + " " + startTime;
        var startTimeMoment = moment(dateString);
        var endDateString = endDate + " " + endTime;
        var endTimeMoment = moment(endDateString);
        var newEvent = {
            "title": title,
            "description": description,
            "start": startTimeMoment.utc().format(),
            "end": endTimeMoment.utc().format(),
            "placeid": placeid
        };
        var keypush = firebaseDB.DB.ref("events").push(newEvent);
        var key = keypush.getKey();
        var startDay = startDate.format("DD")
        var startMonth = startDate.format("MM")
        var startYear = startDate.format("YYYY")
        firebaseDB.DB.ref("dates").child(startYear).child(startMonth).child(startDay).child(key).set(key);
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
    $("#dont-add-event-btn").on("click", function () {
        closeAndClearEditModal();
    });
    $("#cancel-btn").on("click", function () {
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
        $("#empty").show();
        $("#add-col").hide();
        $("#edit-col").hide();
    }

    /** Modal for editing an existing event (Admin Function Only) */
    $("#edit-event-btn").on("click", function () {
        $("#myModal").modal('toggle');
        var id = $(this).data('value')
        var eventObject = $("#calendar").fullCalendar('clientEvents', id)[0];
        var title = eventObject.title;
        var description = eventObject.description;
        var start = eventObject.start;
        var end = eventObject.end;
        placeid = eventObject.placeid;
        console.log(placeid)
        console.log(start);
        console.log(end);
        $("#edit-event-title").val(title);
        $("#edit-event-description").val(description);
        $("#edit-event-title").val(title);
        $("#edit-event-date").val(start.format('YYYY-MM-DD'));
        $("#edit-event-time").val(start.format("hh:mm:ss.ms"));
        $("#edit-event-end-date").val(end.format('YYYY-MM-DD'));
        $("#edit-event-end-time").val(end.format("hh:mm:ss.ms"));
        $("#empty").hide();
        $("#edit-col").show();
        initAutocomplete('edit');
    });

    $("#submit-edit-event-btn").on("click", function () {
        var id = $("#edit-event-btn").data('value');
        var eventObject = $("#calendar").fullCalendar('clientEvents', id)[0];
        var title = $("#edit-event-title").val();
        var description = $("#edit-event-description").val();
        var startDate = $("#edit-event-date").val();
        var startTime = $("#edit-event-time").val();
        var endDate = $("#edit-event-end-date").val();
        var endTime = $("#edit-event-end-time").val();        
        $("#empty").show();        
        $("#edit-col").hide();
        var dateString = startDate + " " + startTime;
        var startTimeMoment = moment(dateString);
        var oldStart = eventObject.start;        
        // checks to see if the month or day has changed. if so, removes the old event from dates and adds the event to the correct date
        if (oldStart.format("MM-DD") != startTimeMoment.format("MM-DD")) {
            var startDay = oldStart.format("DD")
            var startMonth = oldStart.format("MM")
            var startYear = oldStart.format("YYYY")
            firebaseDB.DB.ref("dates").child(startYear).child(startMonth).child(startDay).child(id).set(null);
            var startDay = startTimeMoment.format("DD")
            var startMonth = startTimeMoment.format("MM")
            var startYear = startTimeMoment.format("YYYY")
            firebaseDB.DB.ref("dates").child(startYear).child(startMonth).child(startDay).child(id).set(id);
        }
        var endDateString = endDate + " " + endTime;
        var endTimeMoment = moment(endDateString);
        var editEvent = {
            "title": title,
            "description": description,
            "start": startTimeMoment.utc().format(),
            "end": endTimeMoment.utc().format(),
            "placeid": placeid
        };
        firebaseDB.DB.ref('events').child(id).update(editEvent);
        var index = $("#edit-event-btn").data('index');
        eventsArray[index] = editEvent;
        eventsArray[index].id = id;
        eventsArray[index].index = index;
        eventsArray[index].start = moment(eventsArray[index].start).local();
        eventsArray[index].end = moment(eventsArray[index].end).local();
        $("#calendar").fullCalendar('removeEvents')
        $("#calendar").fullCalendar('renderEvents', eventsArray, true)
    });

    // ** User Registration ** //
    $("#modal-btn").on('click', function(){
       
       var userEmail = null;
       var reminderOn = false;

       if (currentUser === null){
           userEmail = $("#userEmail").val();
           reminderOn = $("#emailReminderOn").is(":checked");
       } else {
           userEmail = currentUser.email;
           reminderOn = currentUser.notificationsOn
       }

       // PRODUCTION
       firebaseDB.registerUserForEvent(userEmail, activeEventId, reminderOn);
       $("#myModal").modal('toggle');
    });
});