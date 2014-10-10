Router.map(function() {
    this.route('home', {
        path: '/',
        template:'home',
        layoutTemplate: 'layout'
    });

    this.route('newTrek', {
        path: '/newTrek',
        onBeforeAction: function () {
            checkLogin();
        }
    });

    this.route('trekConsulting', {
        path: '/trekConsulting/:_id',
        onBeforeAction: function() {
            checkTrekId(this.params._id);
        },
        data: function() {
            var aboutTrek =[];
            aboutTrek.trek = Treks.findOne({_id: this.params._id});
            aboutTrek.detail = Trek_detail.findOne({_trekId: this.params._id});
            return aboutTrek;
        },
        template:"trekConsulting"
    });

    this.route('updateTrek', {
        path: '/updateTrek/:_id',
        onBeforeAction: function() {
            checkTrekId(this.params._id);
        },
        data: function() {
            var aboutTrek =[];
            aboutTrek.trek = Treks.findOne({_id: this.params._id});
            aboutTrek.detail = Trek_detail.findOne({_trekId: this.params._id});
            return aboutTrek;
        },
        template:"updateTrek"
    });

    this.route('account', {
        path: '/account',
        onBeforeAction: function () {
            checkLogin();
        }
    });

    this.route('newTodo', {
        path: '/newTodo',
        onBeforeAction: function () {
            checkLogin();
        }
    });

    this.route('admin', {
        path: '/admin',
        onBeforeAction: function () {
            checkAdminAccess();
        }
    });

    this.route('unauthorized', {
        path: '/unauthorized'
    });

    this.route('notExist', {
        path: '/notExist'
    });

    this.route('notFound', {
        path: '*'
    });
});
/*
var OnBeforeActions;

OnBeforeActions = {
    loginRequired: function(pause) {
        if (!Meteor.userId()) {
            this.render('loginForm');
            return pause();
        }
    }
};

Router.onBeforeAction(OnBeforeActions.loginRequired, {
    only: ['newTrek', 'admin']
});*/

function checkAdminAccess() {
    if (!(Meteor.user() &&
        Meteor.user().profile.type === "admin")) {
        if (!Meteor.loggingIn()) {
            Router.go("unauthorized");
        }
    }
}

function checkLogin() {
    if (!Meteor.user()) {
        if (!Meteor.loggingIn()) {
            Router.go("unauthorized");
        }
    }
}

function checkTrekId(id) {
    if (Treks.find({_id: id}).count() == 0)
        Router.go("notExist");
}
