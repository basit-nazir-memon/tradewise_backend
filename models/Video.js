const mongoose = require('mongoose')
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    title: {type: String, required: true},
    description: {title: String},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    coverImage: {type: String, required: true},
    type: {type: String, enum: ['Live', 'Upcoming', 'Published'], default: 'Published'},
    views: {type: Number, default: 0},
    videoFile: {type: String},
    disabled: {type: Boolean, default: false},
    streamKey: {type: String},
    serverUrl: {type: String}
})

videoSchema.plugin(mongoosePaginate);

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;