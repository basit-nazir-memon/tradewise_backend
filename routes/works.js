const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer();
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const Video = require('../models/Video');
const User = require('../models/User')
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});

let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
            resolve(result);
        } else {
            reject(error);
        }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

async function uploadFile(req) {
    let result = await streamUpload(req);
    return result;
}

router.get('/videos', async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, filterByViews, filterByAuthor, type} = req.query;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : null,
    };

    try {
        let query = {}; 
        query.disabled = false;
        if (filterByViews) {
            query.views = filterByViews;
        }
        console.log("filterByAuthor: ", filterByAuthor);
        if (filterByAuthor) {
            query.author = filterByAuthor;
        }
        if(type){
            query.author = type;
        }
        const videos = await Video.paginate(query, options);

        console.log(videos);
        
        const authorIds = videos.docs.map(video => video.author);

        const authors = await User.find({ _id: { $in: authorIds } }, 'username');

        const videosWithAuthorNames = videos.docs.map(video => {
            const author = authors.find(author => author._id.equals(video.author));
            return {
                ...video.toObject(),
                author: author ? author.username : null,
                authorId: author ? author._id : null
            };
        });

        const modifiedPaginatedResult = {
            ...videos,
            docs: videosWithAuthorNames
        };

        res.json(modifiedPaginatedResult);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// router.get('/videos/mine', auth, async (req, res) => {
//     try {
//         const authorId = req.user.id;
//         console.log(authorId);
//         const posts = await BlogPost.find({ author: authorId });

//         res.json(posts);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

module.exports = router;
