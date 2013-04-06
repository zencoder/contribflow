'use strict';

var branch = require('../lib/branch.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'corrent values for branch.parseName': function(test) {
    var info;
    
    info = branch.parseName('owner/feature/name');
    test.equal(info.name, 'owner/feature/name', 'should have corrent branch name');
    test.equal(info.changeName, 'name', 'should have corrent change name');
    test.equal(info.changeType, 'feature', 'should have corrent change type');
    test.equal(info.owner, 'owner', 'should have corrent owner name');
    test.equal(info.ownerBranchName, 'feature/name', 'should have corrent owner branch name');

    info = branch.parseName('feature/name');
    test.equal(info.name, 'feature/name', 'should have corrent branch name');
    test.equal(info.changeName, 'name', 'should have corrent change name');
    test.equal(info.changeType, 'feature', 'should have corrent change type');
    test.equal(info.owner, undefined, 'should have corrent owner name');
    test.equal(info.ownerBranchName, undefined, 'should have corrent owner branch name');

    info = branch.parseName('owner/name');
    test.equal(info.name, 'owner/name', 'should have corrent branch name');
    test.equal(info.changeName, 'name', 'should have corrent change name');
    test.equal(info.changeType, undefined, 'should have corrent change type');
    test.equal(info.owner, 'owner', 'should have corrent owner name');
    test.equal(info.ownerBranchName, 'name', 'should have corrent owner branch name');

    info = branch.parseName('name');
    test.equal(info.name, 'name', 'should have corrent branch name');
    test.equal(info.changeName, 'name', 'should have corrent change name');
    test.equal(info.changeType, undefined, 'should have corrent change type');
    test.equal(info.owner, undefined, 'should have corrent owner name');
    test.equal(info.ownerBranchName, undefined, 'should have corrent owner branch name');

    test.done();
  },
};
