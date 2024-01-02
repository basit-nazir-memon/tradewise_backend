const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ebookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    coverImage: { type: String, required: true },
    type: { type: String, enum: ['Free', 'Paid'], default: 'Published' },
    introduction: {type: String, required: true},
    price: { type: Number, default: 0 },
    category: {type: String, required: true},
    contents: [
        {
            title: { type: String, required: true },
            content: { type: String, required: true }
        }
    ],
    views: {
        type: Number, default: 0
    },
})

const Ebook = mongoose.model('Ebook', ebookSchema);

module.exports = Ebook;