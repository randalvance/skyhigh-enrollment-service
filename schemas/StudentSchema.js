var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    studentId: Number,
    firstName: String,
    lastName: String
});

module.exports = StudentSchema;