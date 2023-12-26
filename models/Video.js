const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    title: {type: String, required: true},
    description: {title: String},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    coverImage: {type: String, required: true},
    type: {type: String, enum: ['Live', 'Upcoming', 'Published'], default: 'Published'},
    views: {type: Number, default: 0},
    contents: [
        {
            title: {type: String, required: true},
            content: {type: String, required: true}
        }
    ]
})

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;