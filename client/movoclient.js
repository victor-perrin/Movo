Treks = new Meteor.Collection("treks");
Meteor.subscribe("treks");
Steps = new Meteor.Collection("steps");
Meteor.subscribe("steps");
StepsUpdate = new Meteor.Collection("steps_update");
Meteor.subscribe("steps_update");
Trek_detail = new Meteor.Collection("treks_details");
Meteor.subscribe("treks_details");
Trek_photos = new Meteor.Collection("treks_photos");
Meteor.subscribe("treks_photos");
Todos = new Meteor.Collection("todos");
Meteor.subscribe("todos");
Likes = new Meteor.Collection("likes");
Meteor.subscribe("likes");
StepSave = new Meteor.Collection("stepSave");
Meteor.subscribe("stepSave");
MyTreks = new Meteor.Collection("my_treks");
Meteor.subscribe("my_treks");

Meteor.subscribe("users");
Meteor.subscribe("userStatus");

var map;
var directionsDisplay;
var directionDisplayTrek;
var directionUpdate;
var directionsService;
var geocoder;
var autocomplete;
var places;
var markers = [];
var nb_mark = 0;



// #####################################################
// ########           GOOGLEMAPS             ###########
// #####################################################

function calcRoute(collection, display) {

    /* Take a collection of step and display the directions on the map's displayer */
    if (collection == Steps) {
        var t_steps = collection.find({addr: new RegExp("^(?!\s*$).+")}, {sort: {nbr: 1}});
    } else if (collection == StepsUpdate) {
        var t_steps = collection.find({addr: new RegExp("^(?!\s*$).+")}, {sort: {nbr: 1}});
    } else {
        var t_steps = collection.find({trekId: Session.get("idConsultingTrek")}, {sort: {nbr: 1}});
    }
    var count = t_steps.count();
    if (count > 1) {
        var f_steps = t_steps.fetch()
        var waypts = [];
        for (var i = 0; i < count; i++) {
            waypts.push({
                location: f_steps[i].addr,
                stopover: true});
        }
        if (count > 2) {
            var request = {
                origin: waypts[0].location,
                destination: waypts[count-1].location,
                waypoints: waypts,
                travelMode: google.maps.TravelMode.DRIVING
            };
        } else { // There isn't any waipoints
            var request = {
                origin: waypts[0].location,
                destination: waypts[1].location,
                travelMode: google.maps.TravelMode.DRIVING
            };
        }
        directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                display.setDirections(result);
            }
        });
        displayTodo(waypts, display.getMap());
    }
}

/* Take an array of location and display on the map any todo at 100kms around one of the locations */

function displayTodo(waypts, maptodisplay) {
    var latlngS, latlngT;
    var count = Todos.find({}).count();
    var todos = Todos.find({}).fetch();
    var distance;

    clearMarkers();

    /* For each step, we check every todo to see if one is closer that 100kms from the step */

    for(var i = 0; i<waypts.length; i++) {
        geocoder.geocode( { 'address': waypts[i].location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                latlngS = results[0].geometry.location; // Location of the current step

                for(var j = 0; j<count; j++) {
                    latlngT = new google.maps.LatLng(todos[j].lat, todos[j].lng); // Location of the current todo
                    distance = google.maps.geometry.spherical.computeDistanceBetween(latlngS, latlngT);
                    if (distance < 500000) {
                            markers[nb_mark] = new google.maps.Marker({
                            map: maptodisplay,
                            position: latlngT,
                            animation: google.maps.Animation.DROP,
                            title: todos[j].name,
                            content: todos[j]
                            });
                        google.maps.event.addListener(markers[nb_mark], 'click', function() {
                            var infowindow = new google.maps.InfoWindow({
                                content: "<h4>"+this.content.name+"</h4>" +
                                    ((this.content.img != null)?"<img class=\"todo_img\" src=\""+this.content.img+"\">":"")
                                    + "<section class=\"description\">"+ this.content.details+"</section"
                            });
                            infowindow.open(maptodisplay, this);
                        });
                        nb_mark++;
                    }
                }
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });

    }
}

/* Remove all the markers of the map */

function clearMarkers() {
    for(var i=0; i<nb_mark; i++) {
        markers[i].setMap(null);
    }
    nb_mark = 0;
}

/* Initialize all the maps parameter and add event listener on each page containing a map */

GoogleMaps.init(
    {
        'sensor': false, // we do not need geolocalisation
        'key': 'AIzaSyA0IBvz2X6SDy4ku1ujgcVmC0r6VnKDeHc', // Google api key needed to use Maps
        'language': 'fr',
        'libraries': 'places,geometry'
    },
    function () {
        if (Router.current().route.name == "newTrek") {
            google.maps.event.addDomListener(window, "load", initMap);
        } else if (Router.current().route.name == "newTodo") {
            google.maps.event.addDomListener(window, "load", initTodoMap);
        }
    }
);

/* Initialize the map on the NewTrek page */

function initMap() {

    var mapOptions = {
        center: new google.maps.LatLng(41.850033, -87.6500523),
        zoom: 7
    };
    directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();
    directionsDisplay.setMap(map);

}

/* Initialize the map on the Trek consulting page */

function initMapDisplayTreks() {

    var mapOptions = {
        center: new google.maps.LatLng(41.850033, -87.6500523),
        zoom: 7
    };
    directionDisplayTrek = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById("gmapDisplay"), mapOptions);
    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();
    directionDisplayTrek.setMap(map);
}


function initMapUpdate() {

    var mapOptions = {
        center: new google.maps.LatLng(41.850033, -87.6500523),
        zoom: 7
    };
    directionUpdate = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById("map-canvas-update"), mapOptions);
    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();
    directionUpdate.setMap(map);

}

/* Change directions with the autocompletion on the Newtrek page */

function onPlaceChanged() {
    var t_steps = Steps.find({});
    var count = t_steps.count();

    for (var i=1; i<=count; i++) {
        var dest = $("#"+i).val();
        var tmp = Steps.findOne({nbr: i});
        Steps.update(tmp._id, {$set: {addr: dest}});
    }
    calcRoute(Steps, directionsDisplay);
}

function onPlaceChangedUpdate() {
    var t_steps = StepsUpdate.find({});
    var count = t_steps.count();

    for (var i=1; i<=count; i++) {
        var dest = $("#"+i).val();
        var tmp = StepsUpdate.findOne({nbr: i});
        StepsUpdate.update(tmp._id, {$set: {addr: dest}});
    }
    calcRoute(StepsUpdate, directionUpdate);
}


// #####################################################
// ########         updateTrek.html          ###########
// #####################################################

Template.updateTrek.rendered = function(){
    if (Session.get("idUpdatingTrek")!= null) {
        var trek = Treks.findOne({_id: Session.get("idUpdatingTrek")});
        Session.set("nameCreationUpdate", trek.trekName);
        calcRoute(StepsUpdate, directionUpdate);
    }
    };

Template.mapCanvasUpdate.rendered = function(){
    var screenWidth = $(window).width;
    $('#map-canvas-update').width(screenWidth / 2);
    $('#map-canvas-update').height("400px");
    initMapUpdate();
};

Template.updateTrek.saveStep = function() {
    return StepSave.find({trekId: Session.get("idUpdatingTrek")}).fetch();
};

Template.nameOfTrekUpdate.nameUpdateTrek = function() {
    return Session.get("nameCreationUpdate");
};

Template.inputNewTrekUpdate.events({
    'keyup input': function(){
        Session.set("nameCreationUpdate", $("#nameNewTrekUpdate").val());
    }
});

Template.step_field_update.rendered = function () {
    var count = StepsUpdate.find({}).count();

    for (var i = 1; i <= count; i++) {
        autocomplete = new google.maps.places.Autocomplete(document.getElementById(i));
        google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChangedUpdate);
    }
};

Template.steps_list_update.steps = function () {
    return StepsUpdate.find({}, {sort: {nbr: 1}});
};

Template.steps_list_update.is_start = function () {

    if (this.nbr == 1) {
        return true
    } else {
        return false;
    }
};

Template.steps_list_update.is_end = function () {
    var end = StepsUpdate.findOne({}, {sort: {nbr: -1}});

    if (this._id == end._id) {
        return true;
    } else {
        return false;
    }
};

Template.step_field_update.stepAddr = function() {
    return StepsUpdate.findOne({nbr: this.nbr}).addr;
};

Template.step_field_update.number = function () {
    return this.nbr;
};

Template.step_results_update.items = function () {
    return Session.get("step_items");
};

Template.updateTrek.notFinish = function(){
    return !Session.get("finishUpdate");
};

Template.add_step_update.notFinish = function(){
    return !Session.get("finishUpdate");
};

Template.add_step_update.notLimit = function() {
    return StepsUpdate.find({}).count() < 10;
}

Template.add_step_update.events({
    'click input': function () {
        var count = StepsUpdate.find({}).count();
        var end = StepsUpdate.findOne({}, {sort: {nbr: -1}});
        if (count < 10) {
            StepsUpdate.update(end._id, {$inc: {nbr: 1}});
            StepsUpdate.insert({addr : "", nbr : end.nbr});
        }
    }});

Template.stepUpdate.events({
        'click #del': function () {
            var tmp = StepsUpdate.find({nbr: {$gt: this.nbr}});
            var fet = tmp.fetch();
            for(var i= 0; i < tmp.count(); i++){
                StepsUpdate.update(fet[i]._id, {$inc: {nbr: -1}});
            }
            StepsUpdate.remove(this._id);
            calcRoute(StepsUpdate, directionUpdate);
        }
    }
);

Template.stepUpdate.notFinish = function(){
    return !Session.get("finishUpdate");
};

Template.endUpdate.events({
    'click #finishTrek': function() {
        if($("#1").val()!="") {
            Session.set("finishUpdate", true);
            for (var i =1; i<=10; i++)
                $("#"+i).prop("disabled",true);
        } else
            alert("Your trek does not have departure !")
    }
});

Template.commentTrekUpdate.isChecked = function(){
    return Treks.findOne({_id: Session.get("idUpdatingTrek")}).achieved;
};

Template.commentTrekUpdate.events({
    'click #registerTrek': function(){
        var steps = [];
        var colSteps = StepsUpdate.find({});
        var fetchSteps = colSteps.fetch();
        for (var i = 0 ; i<10 ; i++){
            if($("#"+(i+1)).val()!= null)
                steps[i] = $("#"+(i+1)).val();
        }
        var achievement = eval(document.getElementById("achievementUpdate").checked);
        Meteor.call('removeOldTrek',Session.get("idUpdatingTrek"), fetchSteps);
        Meteor.call('updateTrek',Session.get("idUpdatingTrek"), $("#nameNewTrekUpdate").val(), Meteor.user()._id, steps, $("#commentTrekUpdate").val(),achievement);
        for (var i = 0; i<colSteps.count; i++) {
            Steps.remove(fetchSteps[i].id);
        }

        Session.set("finishUpdate", false);
        Session.set("nameCreationUpdate", "");
        Router.go(Router.routes['account'].path());
    },

    'click #returnTrek': function(){
        Session.set("finishUpdate", false);
        for (var i =1; i<=10; i++)
            $("#"+i).prop("disabled",false);
    }
});

// #####################################################
// ########       trekConsulting.html        ###########
// #####################################################

/* Show the map with the steps on the trek consulting page */
Template.trekConsulting.rendered = function(){
    initMapDisplayTreks();
    calcRoute(StepSave, directionDisplayTrek);
};

Template.trek_information.photos = function() {
    return Trek_photos.find({_trekId: Session.get("idConsultingTrek")});
};


/* Allow user to hitchhike a trek if is connected and it's not is own trek */
Template.trek_information.isConnected = function() {
    return !(Meteor.user() == null);
};

Template.trek_information.userIsMe = function() {
    var author = Treks.findOne(Session.get("idConsultingTrek")).author;
    return (Meteor.user()._id == author);
};

/* If the user already hitchhiked the trek, we display the "get down" button */

Template.trek_information.notLike = function(){
    var alreadyLike = Likes.findOne({_trekId: Session.get("idConsultingTrek"), _likerId: Meteor.user()._id});
    return (alreadyLike == null);
};

Template.trek_information.trekAchievement = function() {
    return Treks.findOne({_id: Session.get("idConsultingTrek")}).achieved;
};

Template.trek_information.events({
    'click #like': function () {
        Meteor.call('addLike', Session.get("idConsultingTrek"), Meteor.user()._id);
    },

    'click #doNotLike': function () {
        Meteor.call('removeLike', Session.get("idConsultingTrek"), Meteor.user()._id);
    },

    'click #updateTrek': function() {
        Router.go("updateTrek", {_id: Session.get("idConsultingTrek")});
    },

    'click #picture' : function() {
        window.open(this.url);
    }
});

Template.trek_information.trekGrade = function(){
    return Treks.findOne({_id: Session.get("idConsultingTrek")}).grade;
};

// #####################################################
// ########           newTrek.html           ###########
// #####################################################

/* Add autocompletion on each step field on the newTrek page */

Template.step_field.rendered = function () {
    var count = Steps.find({}).count();

    for (var i = 1; i <= count; i++) {
        autocomplete = new google.maps.places.Autocomplete(document.getElementById(i));
        google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
    }
};

Template.nameOfTrek.nameNewTrek = function() {
    return Session.get("nameCreation");
};

Template.newTrek.events({
    'keyup input': function(){
        Session.set("nameCreation", $("#nameNewTrek").val());
    }
});

Template.mapCanvas.rendered = function(){
    var screenWidth = $(window).width;
    $('#map-canvas').width(screenWidth / 2);
    $('#map-canvas').height("400px");
    initMap();
};

Template.commentTrek.events({
    'click #registerTrek': function(){
        var steps = [];
        for (var i = 0 ; i<10 ; i++){
            if($("#"+(i+1)).val()!= null)
                steps[i] = $("#"+(i+1)).val();
        }
        var achievement = eval(document.getElementById("achievement").checked);
        Meteor.call('addTrek',$("#nameNewTrek").val(), Meteor.user()._id, steps, $("#commentTrek").val(),!achievement,
        function (err, result) {
            if (err) {
                notifyFail(err);
            } else {
                notifySuccess(result);
                console.log(result);

                Router.go(Router.routes['account'].path(), function () {alert("hello")});
            }
        });
        Session.set("finish", false);
        Session.set("nameCreation", "");
            },

    'click #returnTrek': function(){
        Session.set("finish", false);
        for (var i =1; i<=10; i++)
            $("#"+i).prop("disabled",false);
        //initMap();
    }
});

Template.steps_list.steps = function () {
    return Steps.find({}, {sort: {nbr: 1}});
};

Template.steps_list.is_start = function () {
    if (this.nbr == 1) {
        return true
    } else {
        return false;
    }
};

Template.steps_list.is_end = function () {
    var end = Steps.findOne({}, {sort: {nbr: -1}});
    if (this._id == end._id ) {
        return true;
    } else {
        return false;
    }
};

Template.step_field.number = function () {
    return this.nbr;
};

Template.end.number = function () {
    return this.nbr;
};

/*
 Each time the user click on the button, we had one step "box". Maximum is 10.
 */
Template.add_step.events({
    'click input': function () {
        var count = Steps.find({}).count();
        var end = Steps.findOne({}, {sort: {nbr: -1}});
        if (count < 10) {
            Steps.update(end._id, {$inc: {nbr: 1}});
            Steps.insert({addr : "", nbr : end.nbr});
        }
    }});

Template.add_step.notLimit = function() {
    return Steps.find({}).count() < 10;
}

Template.step.events({
        'click #del': function () {
            var tmp = Steps.find({nbr: {$gt: this.nbr}});
            var fet = tmp.fetch();
            for(var i= 0; i < tmp.count(); i++){
                Steps.update(fet[i]._id, {$inc: {nbr: -1}});
            }
            Steps.remove(this._id);
            calcRoute(Steps, directionsDisplay);
        }
    }
);

Template.end.events({
    'click #finishTrek': function() {
        if($("#1").val()!="") {
            Session.set("finish", true);
            for (var i =1; i<=10; i++)
                $("#"+i).prop("disabled",true);
        } else
            alert("Your trek does not have departure !")
    }
});

Template.newTrek.notFinish = function(){
    return !Session.get("finish");
};

Template.add_step.notFinish = function(){
    return !Session.get("finish");
};

Template.step.notFinish = function(){
    return !Session.get("finish");
};

Template.step_results.items = function () {
    return Session.get("step_items");
};


// #####################################################
// ########            movo.html             ###########
// #####################################################

Meteor.startup(function () {
    if (Meteor.user() != null) {
        Session.set("username", Meteor.user().profile.name);
    } else {
        Session.set("username", null);

    }
    Session.set("currentTrekFocused", null);
    Session.set("trek_items", null);

});

Template.login.isLoggedIn = function() {
    return isLoggedIn();
}

Template.lastTreks.isLogged = function() {
    return isLoggedIn();
}

Template.bestTreks.items = function () {
    return findBestTrek();
}

Template.treks_search.items = function () {
    return Session.get("trek_items");
}

Template.treks_search.rendered = function() {
    return Session.set("trek_items", null);
}

Template.trek_detail.photos = function() {
    return Trek_photos.find({_trekId: Session.get("currentTrekFocused")}, {limit: 3});
}

Template.trek_detail.desc = function(id) {
    var description = Trek_detail.findOne({_trekId: id});
    return description != null ? description.description : null;
}

Template.trek_detail.rendered = function () {
    var detail =  $("#trek_detail_"+this.data._id);
    detail.hide();
    detail.fadeIn("slow", function(){});
}

Template.right_panel.rendered = function() {
    Meteor.defer(function() {
        $(".right").css({
            opacity:"0",
            marginLeft:"30px"});
        $(".right").animate({
            marginLeft:"0px",
            opacity:"1"
        }, 1000, function(){
        });
    });
}

Template.bestTodos.rendered = function() {
    Meteor.defer(function() {
        $("#topTodo").css({
            marginTop:"100px",
            opacity:"0"});
        $("#topTodo").animate({
            marginTop:"1%",
            opacity:"1"
        }, 1000, function(){
        });
    });
}

Template.lastTreks.rendered = function() {
    Meteor.defer(function() {
        $("#lastTrek").css({
            opacity:"0"
        });
        $("#lastTrek").animate({
            opacity:"1"
        }, 1000, function(){});
    });
}


Template.bestTreks.rendered = function() {
    Meteor.defer(function() {
        $("#topTrek").css({
            marginTop:"100px",
            opacity:"0"})
        $("#topTrek").animate({
            marginTop:"1%",
            opacity:"1"
        }, 1000, function(){
        });
    });
}

Template.trek.events({
    'mouseover': function(event, t) {
        Session.set("currentTrekFocused", t.data._id);
    },

    'mouseout' : function() {
        Session.set("currentTrekFocused", null);
    },
    'click': function(event, t) {
        console.log(t.data.trekName);
        Router.go("trekConsulting", {_id: t.data._id});
    }
});


Template.trek.isFocused = function(id) {
    return trekIsFocused(id);
}

Template.myTrek.events({
   'click' : function(event, t){
       Router.go("trekConsulting", {_id: t.data._id});
   }
});

Template.research.events({
        'keyup input': function () {
            var text = $("#search_bar").val();
            if (text === "*") {
                var result = Treks.find();
                Session.set("trek_items", result.fetch());
            }
            else if (text.length > 2) {
                var result = Treks.find({trekName: new RegExp(text, 'i')});
                if (result.count() > 0) {
                    Session.set("trek_items", result.fetch());
                    $("#trek_found").animate({top:"300px"}, "slow");
                } else {
                    Session.set("trek_items", null);
                }
            } else {
                if (text.length <= 2) {
                    Session.set("trek_items", null);
                }
            }
        }
    }
);

// #####################################################
// ########           login.html             ###########
// #####################################################

Template.login.events({
    'click input': function (e, t) {
        if (e.target.id == 'signin') {
            hideRegisterForm();
            showLoginForm();
        }
        if (e.target.id == "register") {
            showRegisterForm();
            hideLoginForm();
        }
        if (e.target.id == 'logout') {
            Meteor.logout(function (err) {
                if (err) {
                    notifyFail("Logout failed");
                } else {
                    Session.set("username", null);
                    notifySuccess("Logout with success");
                    Router.go("/");
                }
            });
        }
    }
});

Template.loginForm.events({
    'submit': function (e, t) {
        e.preventDefault();
        // retrieve the input field values
        var email = t.find('#login-email').value
            , password = t.find('#login-password').value;

        // Trim and validate your fields here....
        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        login(email, password);
    },
    'click input': function (e, t) {
        if (e.target.id == 'close_login_form') {
            hideLoginForm();
        }
    }
});


Template.registerForm.events({
    'submit': function (e, t) {
        e.preventDefault();
        var email = t.find('#account-email').value
            , password = t.find('#account-password').value
            , username = t.find("#account-username").value
            , name = username
            ;
        if (username )
        // Trim and validate the input
        var email = trimInput(email);
        if (isValidPassword(password)) {
            Accounts.createUser({
                email: email,
                password: password,
                username: username,
                profile: {
                    name: name,
                    type: "basic_user"
                }
            },
                function (err) {
                    if (err) {
                        $("#register-error").empty();
                        $("#register-error").append(err);
                        notifyFail("Register failed");
                    } else {
                        hideRegisterForm();
                        notifySuccess("You were successfully registered");
                        login(email, password);
                    }
                });
        } else {
            $("#register-error").empty();
            $("#register-error").append("Password need at least 6 characters!");
        }
    },
    'click input': function(e, t) {
        if (e.target.id == 'close_account_form') {
            hideRegisterForm();
        }
    },
    'keyup #account-username': function(e, t) {
        Session.set("account-username", e.target.value);
    },
    'keyup #account-email': function(e, t) {
        Session.set("account-email", e.target.value);
    },
    'keyup #account-password': function(e, t) {
        Session.set("account-password", e.target.value);
    }

});



Template.registerForm.isValidUsername = function() {
    var username = Session.get("account-username");
    return (username !== undefined && username.length >= 3);
}

Template.registerForm.isValidEmail = function() {
    var email = Session.get("account-email");
    return isValidEmail(email);
}

Template.registerForm.isValidPassword = function() {
    var pwd = Session.get("account-password");
    return (pwd !== undefined && isValidPassword(pwd));
}

// Validate username, sending a specific error message on failure.

// #####################################################
// ######## Functions && Procedures Helpers  ###########
// #####################################################


var trimInput = function (val) {
    return val.replace(/^\s*|\s*$/g, "");
}

var isValidPassword = function (val) {
    if (val.length >= 6) {
        return true;
    } else {
        return false;
    }

};

function isValidEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var isValidUsername = function () {
   var username = $('#account-username').val();
    return (username.length >= 3);
};


var hideForm = function(elem)  {
    elem.fadeOut("normal", function () {
    });
}

function showForm(elem) {
    elem.fadeIn("normal", function () {
    });
}

function showLoginForm() {
    $("#login-error").empty();
    showForm($("#login-form"));
}

function showRegisterForm() {
    $("#register-error").empty();
    showForm($("#register-form"));
}

function hideLoginForm() {
    hideForm($("#login-form"));
}

function hideRegisterForm() {
    hideForm($("#register-form"));
}

/**Template functions **/

function findBestTrek() {
    return Treks.find({}, {limit: 1, sort: {grade: -1}});
}

function login(email, password) {
    Meteor.loginWithPassword(email, password, function (err) {
        if (err) {
            $("#login-error").empty();
            $("#login-error").append(err);
            notifyFail("Login failed");

        }
        // The user might not have been found, or their passwword
        // could be incorrect. Inform the user that their
        // login attempt has failed.
        else {
            hideLoginForm();
            Session.set("username", Meteor.user().username);
            notifySuccess("Login successfull");
            Router.go("/");
            $("#lastTreks").animate({
                left: '300px'}, "slow");
        }
        // The user has been logged in.
    });
}

function isLoggedIn() {
    return ((Meteor.user() != null) && (Meteor.user().username != null)
        && (Meteor.user().username != ""));
}

var DateFormats = {
    short: "DD/MM/YYYY",
    long: "dddd DD.MM.YYYY HH:mm"
};

UI.registerHelper("formatDate", function(datetime, format) {
    if (moment) {
        var f = DateFormats[format];
        return moment(datetime).format(f);
    }
    else {
        return datetime;
    }
});

UI.registerHelper("formatBool", function(boolean) {
    if (boolean) return "Achieved";
    else return "Not yet Completed"
});

UI.registerHelper("formatID", function(id) {
    return id;
});

UI.registerHelper("formatAuthor", function(author) {
    var user = Meteor.users.findOne({_id: author}, {});
    return (user != null) ? user.profile.name : "Unknown user";
});

UI.registerHelper("recordId", function(trek){
    Session.set("idConsultingTrek", trek._id);
});

UI.registerHelper("recordIdUpdate", function(trek){
    Session.set("idUpdatingTrek", trek._id);
});


UI.registerHelper("getTrekName", function(trek){
    return trek.trekName;
});

UI.registerHelper("getTrekAuthor", function(trek){
    var user = Meteor.users.findOne({_id: trek.author}, {});
    return user.profile.name;
});

UI.registerHelper("getTrekDate", function(trek){
    var f = DateFormats["long"];
    return moment(trek.submittedOn).format(f);
});

UI.registerHelper("getTrekGrade", function(trek){
    return trek.grade;
});

UI.registerHelper("getTrekDescription", function(detail){
    return (detail!=null) ? detail.description : "";
});

UI.registerHelper("getTrekPhotos", function(trek){
    return Trek_photos.find({_trekId: trek._id});
});

UI.registerHelper("setStepsUpdate", function(){
    StepsUpdate.insert({addr: this.addr, nbr: this.nbr, _id: this._id});
});

trekIsFocused = function(id) {
    var currentFocusedId = Session.get("currentTrekFocused");
    return (currentFocusedId != null && Session.get("currentTrekFocused") === id);
}
