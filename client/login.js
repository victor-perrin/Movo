/**
 * Created by etienne on 28/05/14.
 */
Template.connection.isAdmin = function () {
    return isAdmin();
}

Template.navigation.isAdmin = function () {
    return isAdmin();
}

Template.adminButton.events({
    'click': function(e, t) {
        Router.go("admin");
    }
});

Template.homeButton.events({
    'click': function(e, t) {
        Router.go("home");
    }
});

Template.accountButton.events({
    'click': function(e, t) {
        Router.go("account");
    }
});

Template.newTodoButton.events({
    'click': function(e, t) {
        Router.go("newTodo");
    }
});

Template.users_online.users_alive = function () {
    console.log(Meteor.users.find());
    return Meteor.users.find({"status.online": true});
}

Template.navigation.isOnAdminPage = function() {
    return Router.current().route.name === "admin";
}

Template.welcome.events({
    'click' : function() {
        Router.go("home");
    }
});

isAdmin = function() {
    return (Meteor.user() && Meteor.user().profile.type === "admin");
}