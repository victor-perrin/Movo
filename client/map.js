/**
 * Created by etienne on 05/06/14.
 */

var markers = [];
var autocompleteNewTodo;

/* Initialize the todomap */

initTodoMap = function() {
    var mapOptions = {
        center: new google.maps.LatLng(41.850033, -87.6500523),
        zoom: 7
    };
    mapTodo = new google.maps.Map(document.getElementById("todo-map-canvas"), mapOptions);

    google.maps.event.addListener(mapTodo, 'click', function(event) {
        placeMarker(event.latLng);
    });
    geocoder = new google.maps.Geocoder();

}

var infowindow = null;

Template.newTodo.rendered = function() {
    var screenWidth= $('#todo_creation').width();
    if (screenWidth <= 600) {
        $('#todo-map-canvas').width(screenWidth);
        console.log("<=600", screenWidth, $('#todo-map-canvas').width());
    } else {
        $('#todo-map-canvas').width(screenWidth);
        console.log(">600", screenWidth, $('#todo-map-canvas').width());
    }
    $('#todo-map-canvas').height("400px");
    initTodoMap();
}

Template.researchTodo.events({
    'keyup #search_todo': function(event) {
        if (event.keyCode === 13) {
            var result = $('#search_todo').val();
            if (result.length != 3) {
                geocoder.geocode({address :result}, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        mapTodo.setCenter(results[0].geometry.location, 15);
                        placeMarker(results[0].geometry.location);
                    }
                });
            }
        }
    },
    'keyup #todo_name': function(event, target) {
       var res = $('#todo_name').val();
       infowindow.close();
       infowindow = new google.maps.InfoWindow({
            content: res
        });
        infowindow.open(mapTodo, markers[0]);
    }
});

Template.todoMap.events({

});

placeMarker = function(location) {
    if (!markers.length == 0) {
        markers[0].setMap(null);
    }
    markers = [];
    var marker = new google.maps.Marker({
            position: location,
            map: mapTodo,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

    markers.push(marker);
    Session.set('marker', markers[0].getPosition());
    infowindow = new google.maps.InfoWindow({
        content: 'TODO Point!'
    });
    mapTodo.setCenter(marker.getPosition());
    infowindow.open(mapTodo, marker);
}

Template.researchTodo.rendered = function() {
    markers = [];
    Session.set('marker', null);
    }

Template.search_field.rendered = function() {
    autocompleteNewTodo = new google.maps.places.Autocomplete(document.getElementById("search_todo"));
    google.maps.event.addListener(autocompleteNewTodo, 'place_changed', onPlaceChangedTodo);
}

/* Place marker on the todomap after autocompletion */

function onPlaceChangedTodo() {
    var result = $('#search_todo').val();
    
    geocoder.geocode({address :result}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            mapTodo.setCenter(results[0].geometry.location, 15);
            placeMarker(results[0].geometry.location);
        }
    });

}

Template.researchTodo.hasPoint = function() {
    console.log(Session.get('marker'));
    return (Session.get('marker') != null);
}

Template.formTodo.events({
    'click #todo_submit' : function() {
        var todo_loc = Session.get('marker');
        console.log("Todo loc = ");
        console.log(todo_loc);

        Meteor.call('addTodo', todo_loc.k, todo_loc.B,
            $("#todo_name").val(), $("#todo_details").val(),
            $("#todo_web").val(), $("#todo_img").val(),
            Meteor.user()._id, function(err, result) {
                if (err) {
                    notifyFail(err);
                } else {
                    notifySuccess(result)
                }
                clearTodosFields();
            });

    },'click #todo_cancel': function() {
        clearTodosFields();
    }
});

clearTodosFields = function() {
    Session.set('marker', null);
    $('#search_todo').val('');
    markers[0].setMap(null);
    markers = [];
}

notifySuccess = function(message) {
    notifyMessage($('#messageSuccess'), message);
}

notifyFail = function(message) {
    notifyMessage($('#messageError'), message);
}

notifyMessage = function(container, message) {
    container.empty();
    container.append(message);
    container.show();
    container.fadeOut(3000);
}
