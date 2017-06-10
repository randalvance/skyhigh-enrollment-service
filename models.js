var mongoose = require('mongoose');
var EnrollmentSchema = require('./schemas/EnrollmentSchema');
var StudentSchema = require('./schemas/StudentSchema');
var SubjectSchema = require('./schemas/SubjectSchema');

module.exports = {
    Student: mongoose.model('Student', StudentSchema),
    Subject: mongoose.model('Subject', SubjectSchema),
    Enrollment: mongoose.model('Enrollment', EnrollmentSchema)
};