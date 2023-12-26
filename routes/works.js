const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer();
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const Video = require('../models/Video');
const User = require('../models/User');
const Ebook = require('../models/Ebook')
const auth = require('../middleware/auth')
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

router.get('/videos/mine', auth, async (req, res) => {
    const { type } = req.query;

    try {

        console.log(type);

        const videos = await Video.find({ author: req.user.id })
            .populate('author', 'username fullName profilePic'); // Populate the author field

        let filteredVideos = [];

        if (type == "live"){
            filteredVideos = videos.filter(video => video.type === "Live");
        }else{
            filteredVideos = videos.filter(video => video.type != "Live");
        }

        const videosWithAuthorNames = filteredVideos.map(video => {
            return {
                ...video.toObject(),
                author: video.author ? video.author.username : null,
                authorId: video.author ? video.author._id : null,
                authorName: video.author ? video.author.fullName : null,
                authorProfilePic: video.author ? video.author.profilePic : null,
            };
        });
        res.json(videosWithAuthorNames);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/ebooks/mine', auth, async (req, res) => {
    const { type } = req.query;

    try {
        console.log(type);
        const ebooks = await Ebook.find({ author: req.user.id })
            .populate('author', 'username fullName profilePic'); // Populate the author field

        let filteredEbooks = [];

        if (type){
            if (type == "free"){
                filteredEbooks = ebooks.filter(ebook => ebook.type === "Free");
            }else{
                filteredEbooks = ebooks.filter(ebook => ebook.type != "Free");
            }
        }else{
            filteredEbooks = ebooks;
        }
        

        const ebooksWithAuthorNames = filteredEbooks.map(ebook => {
            return {
                ...ebook.toObject(),
                author: ebook.author ? ebook.author.username : null,
                authorId: ebook.author ? ebook.author._id : null,
                authorName: ebook.author ? ebook.author.fullName : null,
                authorProfilePic: ebook.author ? ebook.author.profilePic : null,
            };
        });
        res.json(ebooksWithAuthorNames);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
