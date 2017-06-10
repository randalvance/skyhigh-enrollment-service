var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var EnrollmentSchema = new Schema({
    student: { type: ObjectId, ref: 'Student' },
    subjects: [{ type: ObjectId, ref: 'Subject' }]
});

var SubjectSchema = new Schema({
    subjectId: Number,
    name: String,
    description: String,
    enrollments: [{ type: ObjectId, ref: 'Enrollment' }]
});

var StudentSchema = new Schema({
    studentId: Number,
    firstName: String,
    lastName: String,
    enrollments: [{ type: ObjectId, ref: 'Enrollment' }]
});

module.exports = {
    Student: mongoose.model('Student', StudentSchema),
    Subject: mongoose.model('Subject', SubjectSchema),
    Enrollment: mongoose.model('Enrollment', EnrollmentSchema)
};