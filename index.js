var restify = require('restify');
var mongoose = require('mongoose');
var amqp = require('amqplib/callback_api');
var async = require('async');

var ObjectId = mongoose.Types.ObjectId;

// Replace depracated built-in MongoDb promise with native Promise
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/skyhigh-enrollment');

var models = require('./models');

var server = restify.createServer({
    name: 'skyhigh.enrollment',
    version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/api/students', function (req, res) {
    models.Student.find({}, function (err, students) {
        res.send(students);
    });
});
server.get('/api/subjects', function (req, res) {
    models.Subject.find({}, function (err, subjects) {
        res.send(subjects);
    });
});
server.get('/api/enrollments', function (req, res) {
    models.Enrollment.find({}, function (err, enrollments) {
        res.send(enrollments);
    });
});
server.post('/api/enrollments', function (req, res) {
    var enrollment = req.body;
    var studentId, subjectIds;

    async.waterfall([
        function (callback) {
            models.Student.findOne({ studentId: enrollment.studentId }, function (err, student) {
                console.log(student);
                studentId = new ObjectId(student._id);
                callback(null, studentId);
            });
        },
        function (studentId, callback) {
            models.Subject.find({
                subjectId: { $in: enrollment.subjectIds }
            }, function (err, subjects) {
                console.log(subjects);
                subjectIds = subjects.map(subject => new ObjectId(subject.subjectId));
                callback(null, subjectIds, studentId);
            });
        },
        function (subjectIds, studentId, callback) {
            var newEnrollment = new models.Enrollment({
                student: studentId,
                subjects: subjectIds
            });

            newEnrollment.save(function (err, enrollment) {
                if (err) throw err;

                callback(null);
            });
        }
    ], function (err, result) {
        if (err) return console.error(err);

        console.log('success!');
        res.send(201);
    });
});

server.listen(3000, function () {
    console.log('%s listening at %s', server.name, server.url);
});


amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(require('./channels/studentChannel'));
    conn.createChannel(require('./channels/subjectChannel'));
});