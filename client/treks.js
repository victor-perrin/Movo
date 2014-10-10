/**
 * Created by etienne on 03/06/14.
 */

Template.letsCreateANewTrek.events({
    'click': function() {
        Router.go('newTrek');
    }
});

Template.myTreks.items = function() {
    return Treks.find({author: Meteor.user()._id}).fetch();
}

Template.myPersonnalTreks.items = function() {
    //return all treks of a user sorted by last created
    return Treks.find({author: Meteor.user()._id}, { limit:2, sort:{submittedOn:-1}}).fetch();
}

Template.lastTreksPutOnline.items = function() {
    return Treks.find({}, { limit:2, sort:{submittedOn:-1}}).fetch();
}

Template.trek_no_detail.events({
    'mouseover': function(event, t) {
        Session.set("currentLastTrekFocused", t.data._id);
    },
    'mouseout' : function() {
        Session.set("currentLastTrekFocused", null);
    },
    'click': function(event, t) {
        Router.go("trekConsulting", {_id: t.data._id});
    }
});

Template.trek_no_detail.isFocused = function(id) {
    return trekIsFocused(id);
}

Template.newTrekButton.events({
    'click': function() {
        var colSteps = Steps.find({});
        var fetchSteps = colSteps.fetch();
        for (var i = 0; i<colSteps.count(); i++) {
            Steps.remove(fetchSteps[i]._id);
        }
        Steps.insert({addr : "", nbr : 1});
        Steps.insert({addr : "", nbr : 2});

        Session.set("nameCreation", "");

        Router.go("newTrek");
    }
});

Template.updateTrekButton.events({
    'click': function() {
        var colSteps = StepsUpdate.find({});
        var fetchSteps = colSteps.fetch();
        for (var i = 0; i<colSteps.count(); i++) {
            StepsUpdate.remove(fetchSteps[i]._id);
        }

        var stepExist = StepSave.find({trekId : Session.get("idConsultingTrek")});

        if(stepExist.count() == 0) {
            StepsUpdate.insert({addr: "", nbr: 1});
            StepsUpdate.insert({addr: "", nbr: 2});
        } else if (stepExist.count() == 1) {
            StepsUpdate.insert({addr: "", nbr: 2});
        }

        Session.set("nameCreationUpdate", "");

        Router.go("newTrek");
    }
});