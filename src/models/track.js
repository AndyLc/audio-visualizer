var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    bcrypt = require('bcrypt');

var TrackSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    artists: {
        type: String,
        required: true
    },
    duration: {
      type: Number,
      required: true
    },
    source: {
        type: String,
        required: true
    },
    notes: {
        type: Array,
        required: true
    },
    id: {
        type: ObjectId
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Track', TrackSchema);
