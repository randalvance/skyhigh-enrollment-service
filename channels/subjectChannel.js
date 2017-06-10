var createChannel = require('./createChannel');
var Subject = require('../models').Subject;

var subjectChannel = createChannel('subjects', function (msg) {
    console.log(' [x] %s', msg.content.toString());
    var subject = JSON.parse(msg.content.toString());

    var newSubject = new Subject({
        subjectId: subject.SubjectId,
        name: subject.Name,
        description: subject.Description
    });
    newSubject.save(function (err, subject) {
        if (err) {
            throw err;
        }

        console.log('\nSubject created: ' + subject);
    });
});

module.exports = subjectChannel;