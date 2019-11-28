exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: 'First post',
                content: 'This is the first post!',
                imageUrl: 'images/aman.jpg',
                creator: {
                    name: 'Aman'
                },
                createdAt: new Date()
            },
        ]
    });
};

exports.postPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        message: 'Post created successfully',
        post: {
            _id: new Date().toISOString(),
            title: title,
            content: content,
            creator: {
                name: 'Aman'
            },
            createdAt: new Date()
        },
    });
};