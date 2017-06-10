var createChannel = require('./createChannel');
var Student = require('../models').Student;

var studentChannel = createChannel('students', function (msg) {
    console.log(' [x] %s', msg.content.toString());
    var student = JSON.parse(msg.content.toString());

    var newStudent = new Student({
        studentId: student.StudentId,
        firstName: student.FirstName,
        lastName: student.LastName
    });

    newStudent.save(function (err, student) {
        if (err) {
            throw err;
        }

        console.log('\Student created: ' + student);
    });
});

module.exports = studentChannel;