const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BlogPost = require('../models/BlogPost'); 
const User = require('../models/User');
const multer = require("multer");
const upload = multer();
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
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

router.post('/', auth, upload.single("featuredImage"), async (req, res) => {
    if (req.file) {
        const uploaded = await uploadFile(req);

        const { title, content } = req.body;
            try {
                const newPost = new BlogPost({
                    title,
                    content,
                    author: req.user.id,
                    imageUrl: uploaded.url,
                });
                const post = await newPost.save();
                res.json(post);
            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
            }
    }else{
        res.status(500).send('Attach the Image File');
    }
});

router.get('/', async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, filterByAverageRating, filterByAuthor, filterByDate } = req.query;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : null,
    };

    try {
        let query = {}; 
        query.disabled = false;
        if (filterByAverageRating) {
            query.averageRating = filterByAverageRating;
        }
        console.log("filterByAuthor: ", filterByAuthor);
        if (filterByAuthor) {
            query.author = filterByAuthor;
        }
        if (filterByDate) {
            // Assuming filterByDate is a range like "2023-01-01,2023-12-31"
            const [startDate, endDate] = filterByDate.split(',');
            query.created_at = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const posts = await BlogPost.paginate(query, options);

        console.log(posts);
        
        const authorIds = posts.docs.map(post => post.author);

        const authors = await User.find({ _id: { $in: authorIds } }, 'username');

        const postsWithAuthorNames = posts.docs.map(post => {
            const author = authors.find(author => author._id.equals(post.author));
            return {
                ...post.toObject(),
                author: author ? author.username : null 
            };
        });

        const modifiedPaginatedResult = {
            ...posts,
            docs: postsWithAuthorNames
        };

        res.json(modifiedPaginatedResult);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/mine', auth, async (req, res) => {
    try {
        const authorId = req.user.id;
        console.log(authorId);
        const posts = await BlogPost.find({ author: authorId });

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:id', auth, upload.single("featuredImage"), async (req, res) => {
    let uploaded;
    if (req.file) {
        uploaded = await uploadFile(req);
    }
    const { title, content } = req.body;
    try {
        let post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. Not the post author' });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.imageUrl = (uploaded && uploaded.url) || post.imageUrl,

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. Not the post author' });
        }
        await post.deleteOne();
        res.json({ msg: 'Post deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/:id/rate', auth, async (req, res) => {
    const { rating } = req.body;

    try {
        
        let post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const userRating = post.ratings.find((r) => r.user.toString() === req.user.id);
        if (userRating) {
            userRating.value = rating;
        } else {
            post.ratings.push({ user: req.user.id, value: rating });
        }
    
        const totalRatings = post.ratings.reduce((sum, r) => sum + r.value, 0);
        post.averageRating = totalRatings / post.ratings.length;

        await post.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/:id/comment', auth, async (req, res) => {
    const { text } = req.body;

    try {
        let post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        post.comments.push({
            user: req.user.id,
            text,
        });
        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
