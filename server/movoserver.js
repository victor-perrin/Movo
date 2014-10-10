Treks = new Meteor.Collection("treks");
Trek_detail = new Meteor.Collection("treks_details");
Trek_photos = new Meteor.Collection("treks_photos");

Steps = new Meteor.Collection("steps");
StepsUpdate = new Meteor.Collection("steps_update");
StepSave = new Meteor.Collection("stepSave");

Todos = new Meteor.Collection("todos");

Likes = new Meteor.Collection("likes");


Steps.allow({
    insert: function (addr, nbr) {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});

StepsUpdate.allow({
    insert: function (addr, nbr) {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});

Meteor.methods({

    addTrek : function(trekName, idAuthor, steps, comment, achievement){
        console.log('Adding Trek ...');

        var trekId = new Meteor.Collection.ObjectID()._str;

        // Save a trek in database
        Treks.insert({
            _id: trekId,
            trekName: trekName,
            submittedOn: new Date(),
            grade: 0,
            author: idAuthor,
            achieved: achievement
        });

        // Save all steps of the trek in database
        for (i = 0; i < steps.length; i++) {
            if(steps[i] != "") {
                var stepId = new Meteor.Collection.ObjectID()._str;
                StepSave.insert({
                    _id: stepId,
                    trekId: trekId,
                    addr: steps[i],
                    nbr: i + 1
                });
            }
        }

        // Save the author's description about the trek in database
        var commId = new Meteor.Collection.ObjectID()._str;
        Trek_detail.insert({
            _id : commId,
            _trekId : trekId,
            description : comment
        });
        console.log(trekId);

        return trekName;
    },

    removeOldTrek : function(trekId, stepsId){
        console.log("Remove ...");

        Treks.remove({_id: trekId});
        for(var i=0; i<stepsId.length; i++){
            Steps.remove({_id: stepsId._id});
        }

        console.log(trekId);
    },

    updateTrek : function(oldTrekId, trekName, idAuthor, steps, comment, achievement){
        console.log('Updating Trek ...');

        var trekId = new Meteor.Collection.ObjectID()._str;

        // Save a trek in database
        Treks.insert({
            _id: trekId,
            trekName: trekName,
            submittedOn: new Date(),
            grade: 0,
            author: idAuthor,
            achieved: achievement
        });

        // Save all steps of the trek in database
        for (i = 0; i < steps.length; i++) {
            if(steps[i] != "") {
                var stepId = new Meteor.Collection.ObjectID()._str;

                StepSave.insert({
                    _id: stepId,
                    trekId: trekId,
                    addr: steps[i],
                    nbr: i + 1
                });
            }
        }

        // Save the author's description about the trek in database
        var commId = new Meteor.Collection.ObjectID()._str;
        Trek_detail.insert({
            _id : commId,
            _trekId : trekId,
            description : comment
        });

        Likes.remove({_trekId : oldTrekId});

        var oldPhoto = Trek_photos.find({_trekId : oldTrekId}).fetch();
        for(var j = 0; j < oldPhoto.length; j++) {
            Trek_photos.update(oldPhoto[j]["_id"], {$set : {_trekId : trekId}});
        }

        console.log(trekId);
        return trekName;
    },

    addLike : function(idTrek, idLiker){
        var likeId = new Meteor.Collection.ObjectID()._str;
        Likes.insert({
            _id : likeId,
            _trekId : idTrek,
            _likerId : idLiker,
            date : new Date()
        });
        Treks.update(idTrek , {$inc: {grade: 1}} );
    },

    removeLike : function(idTrek, idLiker) {
        Likes.remove({_trekId: idTrek, _likerId: idLiker});
        Treks.update(idTrek, {$inc: {grade: -1}});
    },

    addTodo : function(lat, lng, todoName, desc, web, img, author){
        console.log('Adding Todo ...');
        console.log(lat, lng);
        var todoId = new Meteor.Collection.ObjectID()._str;
        // Save a todo in database

        if (lat == null || lng == null || todoName == null || author == null) {
            throw new Error("One field or more are empty");
        }

        Todos.insert({
            _id: todoId,
            lat: lat,
            lng:lng,
            name:todoName,
            details:desc,
            web:web,
            img:img,
            author:author,
            submittedOn: new Date()
        });

        console.log(todoId);
        return "Todo has been created successfully";
    }
});


Meteor.startup(function () {

    Treks.remove({});
    Trek_detail.remove({});
    Meteor.users.remove({});

    var trekId1 = new Meteor.Collection.ObjectID()._str;
    var trekId2 = new Meteor.Collection.ObjectID()._str;
    var trekId3 = new Meteor.Collection.ObjectID()._str;
    var trekId4 = new Meteor.Collection.ObjectID()._str;
    var trekId5 = new Meteor.Collection.ObjectID()._str;
    var stepId1 = new Meteor.Collection.ObjectID()._str;
    var stepId2 = new Meteor.Collection.ObjectID()._str;
    var stepId3 = new Meteor.Collection.ObjectID()._str;
    var stepId4 = new Meteor.Collection.ObjectID()._str;

var victorId =
    Accounts.createUser({
        username: "viper",
        email: "victor.perrin8@gmail.com",
        password: "viper",
        profile: {
            name: "Victor Perrin",
            type: "admin"
        }
    });

    var etienneId =
    Accounts.createUser({
        username: "etienne.cadic",
        email: "etiennecadic@gmail.com",
        password: "starfrag",
        profile: {
            name: "Étienne Cadic",
            type: "admin"
        }
    });

var jeremId =
    Accounts.createUser({
            username: "maritazj",
            email: "jeremy.maritaz@gmail.com",
            password: "coco",
            profile :
            {
                name: "Jérémy Maritaz",
                type: "admin"
            }
    });

    Treks.insert({_id: trekId1, trekName : "France backpacking", submittedOn:new Date(), grade: 59, author: jeremId, achieved:true});
    Trek_detail.insert({_id: "1", _trekId: trekId1, description: "Ce trek est absolument, magnifique, plein de vie, de chakaboum et de chewing gums enchevétrés les uns dans les autres!"});
    Trek_photos.remove({});
    Trek_photos.insert({_id: "1", _trekId: trekId1, url:"http://mountaineeringjoe.co.uk/wp-content/uploads/2013/03/spain-christmas07-023.jpg"});
    Trek_photos.insert({_id: "2", _trekId: trekId1, url:"http://www.tablemountain.my-hiking.com/wp-content/uploads/2012/12/South-Africa-Cape-Point-03.jpg"});

    Treks.insert({_id: trekId2, trekName : "Europe tour", submittedOn: new Date(2014, 01, 01), grade:59, author: victorId, achieved:true});
    Treks.insert({_id: trekId3, trekName : "Latin america", submittedOn: new Date(2014, 01, 01), grade:50, author: victorId, achieved:true});
    Treks.insert({_id: trekId4, trekName : "India to Thailand", submittedOn: new Date(), grade:100, author: jeremId, achieved:false});
    Treks.insert({_id: trekId5,trekName : "Interrail", submittedOn: new Date(2014, 05, 07), grade:24, author: etienneId, achieved:false});

    StepSave.remove({});
    StepSave.insert({_id : stepId1, trekId : trekId1, addr : "Paris, France", nbr : 1});
    StepSave.insert({_id : stepId2, trekId : trekId1, addr : "Lyon, France", nbr : 2});
    StepSave.insert({_id : stepId3, trekId : trekId1, addr : "Nice, France", nbr : 3});
    StepSave.insert({_id : stepId4, trekId : trekId2, addr : "Caen, France", nbr : 1});

    Steps.remove({});
    Steps.insert({addr : "", nbr : 1});
    Steps.insert({addr : "", nbr : 2});

    StepsUpdate.remove({});

//    Todos.remove({});
//
//    Todos.insert({_id: new Meteor.Collection.ObjectID()._str,lat: 41.890033, lng: -87.6800523, name: "Super Todo", details: "C'est trop bien", web:"http://www.google.fr",
//        img:"http://images.huffingtonpost.com/2012-10-15-BourgoyenSpringII.jpg", author: victorId, submittedOn: new Date()});
//    Todos.insert({_id: new Meteor.Collection.ObjectID()._str, lat: 41.8781136, lng: -87.62979819999998, name: "Great Todo", details: "C'est trop bien", web:"http://www.google.fr",
//        img:"http://images.huffingtonpost.com/2012-10-15-BourgoyenSpringII.jpg", author: victorId, submittedOn: new Date()});

    Likes.remove();
});

Accounts.validateNewUser(function (user) {
    if (user.username && user.username.length >= 3)
        return true;
    return new Meteor.Error(403, "Username must have at least 3 characters");
});

Accounts.onCreateUser(function(options, user) {
    // We still want the default hook's 'profile' behavior.
    if (options.profile)
        user.profile = options.profile;
    return user;
});

Accounts.config({
    sendVerificationEmail: true,
    forbidClientAccountCreation:false
});

Meteor.publish("treks", function () {
    return Treks.find(); // everything
});

Meteor.publish("my_treks", function () {
    return Treks.find({author: this.userId});
});

Meteor.publish("treks_details", function () {
    return Trek_detail.find(); // everything
});

Meteor.publish("treks_photos", function () {
    return Trek_photos.find(); // everything
});

Meteor.publish("userStatus", function () {
   return Meteor.users.find({ "status.online": true });
});

Meteor.publish("steps", function () {
    return Steps.find(); // everything
});

Meteor.publish("steps_update", function () {
    return StepsUpdate.find(); // everything
});

Meteor.publish("stepSave", function () {
    return StepSave.find(); // everything
});

Meteor.publish("todos", function () {
    return Todos.find(); // everything
});

Meteor.publish("users", function () {
    return Meteor.users.find(); // everything
});

Meteor.publish("likes", function() {
    return Likes.find(); //everything
});
