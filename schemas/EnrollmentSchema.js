var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var StudentSchema = require('./StudentSchema');
var SubjectSchema = require('./SubjectSchema');

var EnrollmentSchema = new Schema({
    student: { type: ObjectId, ref: 'Student' },
    subjects: [{ type: ObjectId, ref: 'Subject' }]
});

module.exports = EnrollmentSchema;