var assert = require('assert');
suite('basicTests', function() {
    // ensure that -
    // (2) we can connect to the collection
    // (3) the collection is empty
    test('server initialization - insert into MongoDB', function(done, server) {
        server.eval(function() {
            var collection = Treks.find({}, {limit:1, sort:{grade: -1}}).fetch();
            emit('treks', collection);
        }).once('treks', function(collection) {
            assert.equal(collection.length, 1);
            assert.equal(collection[0].trekName, "India to Thailand");
            done();
        });
        done();
    });

    test('admin accounts created - ', function(done, server) {
        server.eval(function() {
            Meteor.setTimeout(function() {
                emit('after-200-millisecs');
            }, 200);
        }).once('after-200-millisecs', function() {
            server.eval(function() {
                var users = Meteor.users.find().fetch();
                emit('users', users);
            }).once('users', function(users) {
                assert.equal(users[0].username, "viper");
                assert.equal(users[1].username, "etienne.cadic");
                assert.equal(users[2].username, "maritazj");
                done();
            });
        });
    });

});
