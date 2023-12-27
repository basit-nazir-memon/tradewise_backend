const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(), // or use multer.diskStorage() for disk storage
    limits: {
      fileSize: 5 * 1024 * 1024, // Adjust the file size limit as needed
    },
});
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


router.get('/author/:id/videos', async (req, res) => {
    const { type } = req.query;

    try {
        const videos = await Video.find({ author: req.params.id })
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

// router.post('/upload/video', upload.single("file"), async (req, res)=>{
//     if (req.file){
//         const uploadedVideoFile = await uploadFile(req);
//         res.json({url: uploadedVideoFile.url});
//         console.log(uploadedVideoFile.url);
//     }else{
//         res.status(404).json({msg: "Attach the File"});
//     }
// })

router.post('/ebooks', auth, async (req, res) => {

    console.log("Ebooks");
    let { title, introduction, category, coverImage, contents, price, bookType } = req.body;
    console.log("Ebooks");

    console.log(req.body);
    
    console.log("Ebooks");

    const newEbook = new Ebook({
        title: title,
        author: req.user.id,
        coverImage: coverImage,
        type: bookType == 'free' ? 'Free' : 'Paid',
        introduction: introduction,
        price: price,
        category: category,
        contents: contents,
    });

    const ebook = await newEbook.save();
    res.json(ebook);
});

router.post('/videos', auth, upload.single('coverImage'), async (req, res) => {
    if (req.file) {
        try {
            const uploadedImage = await uploadFile(req);

            let { title, description, publishTime, videoUrl } = req.body;

            publishTime==="Now"? publishTime = "Published" : "Upcoming";

            const newVideo = new Video({
                title,
                description,
                author: req.user.id,
                coverImage: uploadedImage.url,
                type: publishTime,
                videoFile: videoUrl,
            });

            const video = await newVideo.save();
            res.json(video);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    } else {
        res.status(400).send('Attach coverImage');
    }
});

router.post('/videos/live', auth, async (req, res) => {
    try {
        let { serverUrl, streamKey, title, coverImage, introduction } = req.body;

        const newVideo = new Video({
            title: title,
            description: introduction,
            author: req.user.id,
            coverImage: coverImage,
            type: "Live",
            streamKey: streamKey,
            serverUrl: serverUrl
        });

        const video = await newVideo.save();
        res.json(video);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Handle video file upload
router.post('/upload/video', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const result = await cloudinary.uploader.upload_stream({ resource_type: 'video' }, (error, result) => {
            if (result) {
            res.json({ url: result.secure_url });
            } else {
            console.error(error);
            res.status(500).json({ error: 'Error uploading video' });
            }
        }).end(req.file.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Handle video file upload
router.post('/upload/image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
    
        const result = await uploadFile(req);
        console.log(result);

        res.json({url: result.url});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.delete('/videos/:id', auth, async (req, res) => {
    try {
        console.log(req.params.id);
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ msg: 'Video not found' });
        }
        if (video.author.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. Not the video author' });
        }
        await video.deleteOne();
        res.json({ msg: 'Video deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


router.delete('/ebooks/:id', auth, async (req, res) => {
    try {
        const ebook = await Ebook.findById(req.params.id);
        if (!ebook) {
            return res.status(404).json({ msg: 'Ebook not found' });
        }
        if (ebook.author.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. Not the ebook author' });
        }
        await ebook.deleteOne();
        res.json({ msg: 'Ebook deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;