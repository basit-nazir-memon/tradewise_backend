const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const ebookSchema = new Schema({
    title: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    coverImage: {type: String, required: true},
    type: {type: String, enum: ['Live', 'Upcoming', 'Published'], default: 'Published'},
    contents: [
        {
            title: {type: String, required: true},
            content: {type: String, required: true}
        }
    ],
    views: {type: Number, default: 0},
})

const Ebook = mongoose.model('Video', ebookSchema);

module.exports = Ebook;