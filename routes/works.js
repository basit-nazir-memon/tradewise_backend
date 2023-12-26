const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer();
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const Video = require('../models/Video');
const User = require('../models/User');
const Book = require('../models/Ebook');
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
    const { page = 1, limit = 10, sortBy, sortOrder, filterByViews, filterByAuthor, type } = req.query;
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
        if (type) {
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

router.get('/MustWatchLive', async (req, res) => {
    try {
        const videos = await Video.find({ type: 'Live' }).populate('author', 'fullName profileImage');

        const fetchedData = videos.map(video => ({
            name: video.author.fullName,
            title: video.title,
            source: video.coverImage,
            views: video.views,
            type: video.type,
            imageSrc: video.author.profileImage
        }));

        res.json(fetchedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/TopStreamers', async (req, res) => {

    try {

        const users = await User.find({}, '_id fullName userInfo');

        const userCounts = await Promise.all(
            users.map(async user => {
                const followerCount = await Follow.countDocuments({ following: user._id });
                return {
                    _id: user._id,
                    fullName: user.fullName,
                    userInfo: user.userInfo,
                    followersCount: followerCount
                };
            })
        );

        res.json(userCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }


});
router.get('/TrendingVideo', async (req, res) => {
    try {
        const videos = await Video.find({ type: 'Published' }).populate('author', 'fullName profileImage');

        const fetchedData = videos.map(video => ({
            name: video.author.fullName,
            title: video.title,
            source: video.coverImage,
            views: video.views,
            type: video.type,
            imageSrc: video.author.profileImage
        }));

        res.json(fetchedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('HotVideos', async (req, res) => {
    try {
        const videos = await Video.find({ type: 'Upcoming' }).populate('author', 'fullName profileImage');

        const fetchedData = videos.map(video => ({
            name: video.author.fullName,
            title: video.title,
            source: video.coverImage,
            views: video.views,
            type: video.type,
            imageSrc: video.author.profileImage
        }));

        res.json(fetchedData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/popularbooks', async (req, res) => {
    try {
        const book = Book.find({ type: "Published" }).populate('author', 'fullName profileImage');
        const fetchedData = book.map(book => ({
            name: book.author.fullName,
            title: book.title,
            source: book.coverImage,
            views: book.views,
            type: book.type,
            imageSrc: book.author.profileImage
        }));

        res.json(fetchedData);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/TopLecturer',async(req,res)=>{
    try {

        const users = await User.find({}, '_id fullName userInfo ProfileImage');

        const userCounts = await Promise.all(
            users.map(async user => {
                const followerCount = await Follow.countDocuments({ following: user._id });
                return {
                    _id: user._id,
                    fullName: user.fullName,
                    userInfo: user.userInfo,
                    ProfileImage:user.ProfileImage,
                    followersCount: followerCount
                };
            })
        );

        res.json(userCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

})
module.exports = router;
