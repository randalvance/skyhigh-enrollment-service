var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubjectSchema = new Schema({
    subjectId: Number,
    name: String,
    description: String
});

module.exports = SubjectSchema;