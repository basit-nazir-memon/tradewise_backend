const mongoose = require ('mongoose')
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    title: {type: String, required: true},
    description: {title: String},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    coverImage: {type: String, required: true},
    type: {type: String, enum: ['Live', 'Upcoming', 'Published'], default: 'Published'},
    views: {type: Number, default: 0},
    videoFile: {type: String, required: true},
    disabled: {type: Boolean, default: false}
})

videoSchema.plugin(mongoosePaginate);

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;