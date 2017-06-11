var restify = require('restify');
var mongoose = require('mongoose');
var amqp = require('amqplib/callback_api');
var async = require('async');

var ObjectId = mongoose.Types.ObjectId;

// Replace depracated built-in MongoDb promise with native Promise
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://mongo/skyhigh-enrollment');

var models = require('./models');

var server = restify.createServer({
    name: 'skyhigh.enrollment',
    version: '1.0.0'
});
server.use(
    function crossOrigin(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        return next();
    }
);
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
    models.Enrollment.find().populate('student subjects').exec(function (err, enrollments) {
        res.send(enrollments);
    });
});
server.post('/api/enrollments', function (req, res) {
    var enrollment = req.body;
    var student = enrollment.student;
    var subjects = enrollment.subjects;

    async.waterfall([
        function (callback) {
            var enrollment = new models.Enrollment({});
            enrollment.save(function (err, enrollment) {
                callback(null, enrollment);
            });
        },
        function (enrollment, callback) {
            console.log(student.studentId);
            models.Student.findOneAndUpdate({ studentId: student.studentId }, student, { upsert: true, setDefaultsOnInsert: true, new: true }, function (err, student) {
                if (err) return res.send(500, { error: err });

                enrollment.student = student._id;

                student.enrollments.push(enrollment._id);
                student.save(function (err, student) {
                    callback(null, enrollment);
                });
            });
        },
        function (enrollment, callback) {
            async.each(subjects, function (subject, callback) {
                async.waterfall([
                    function (callback) {
                        models.Subject.findOneAndUpdate({ subjectId: subject.subjectId }, subject, { upsert: true, setDefaultsOnInsert: true, new: true }, function (err, subject) {
                            callback(null, subject);
                        });
                    },
                    function (subject, callback) {
                        subject.enrollments.push(enrollment._id);
                        subject.save(function (err, subject) {
                            callback(null, subject);
                        });
                    },
                    function (subject, callback) {
                        enrollment.subjects.push(subject._id);
                        callback(null);
                    }
                ], function (err) {
                    callback();
                });
            }, function (err) {
                if (err) return res.send(500, { error: err });

                enrollment.save();
                callback(null);
            });
        }
    ], function (err, result) {
        if (err) return console.error(err);

        console.log('success!');
        res.send(201);
    });
});

server.listen(3001, function () {
    console.log('%s listening at %s', server.name, server.url);
});

// This is a hack for now, we need to wait for a few seconds for rabbitMQ to be ready
setTimeout(function () {
    amqp.connect('amqp://rabbitmq', function (err, conn) {
        conn.createChannel(require('./channels/studentChannel'));
        conn.createChannel(require('./channels/subjectChannel'));
    });
}, 5000);