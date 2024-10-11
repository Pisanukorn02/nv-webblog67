const { Blog } = require('../models');
const { Op } = require('sequelize'); // Import Sequelize operators

module.exports = {
    // Get all blogs or search blogs
    async index(req, res) {
        try {
            const search = req.query.search;
            let blogs;

            if (search) {
                blogs = await Blog.findAll({
                    where: {
                        [Op.or]: [
                            { title: { [Op.like]: `%${search}%` } },
                            { content: { [Op.like]: `%${search}%` } },
                            { category: { [Op.like]: `%${search}%` } }
                        ]
                    },
                    order: [['updatedAt', 'DESC']]
                });
            } else {
                blogs = await Blog.findAll({
                    order: [['updatedAt', 'DESC']]
                });
            }

            res.send(blogs);
        } catch (err) {
            console.error('Error fetching blogs:', err); // Log the error for debugging
            res.status(500).send({
                error: 'An error has occurred while fetching the blogs'
            });
        }
    },

    // Create a new blog
    async create(req, res) {
        try {
            console.log('Blog create req.body:', req.body);
            const blog = await Blog.create(req.body);
            console.log('Blog created:', blog);
            res.send(blog.toJSON());
        } catch (err) {
            console.error('Error creating blog:', err); // Log the error for debugging
            res.status(500).send({
                error: 'Failed to create the blog'
            });
        }
    },

    // Update a blog (edit, suspend, activate)
    async put(req, res) {
        try {
            const [updatedRowsCount, updatedRows] = await Blog.update(req.body, {
                where: { id: req.params.blogId },
                returning: true, // To get the updated blog back
                plain: true
            });

            if (updatedRowsCount === 0) {
                return res.status(404).send({
                    error: 'Blog not found'
                });
            }

            res.send(updatedRows);
        } catch (err) {
            console.error('Error updating blog:', err); // Log the error for debugging
            res.status(500).send({
                error: 'Failed to update the blog'
            });
        }
    },

    // Delete a blog
    async remove(req, res) {
        try {
            const blog = await Blog.findOne({
                where: { id: req.params.blogId }
            });

            if (!blog) {
                return res.status(404).send({
                    error: 'Blog not found'
                });
            }

            await blog.destroy();
            res.send(blog);
        } catch (err) {
            console.error('Error deleting blog:', err); // Log the error for debugging
            res.status(500).send({
                error: 'Failed to delete the blog'
            });
        }
    },

    // Get a blog by ID
    async show(req, res) {
        try {
            const blog = await Blog.findByPk(req.params.blogId);

            if (!blog) {
                return res.status(404).send({
                    error: 'Blog not found'
                });
            }

            res.send(blog);
        } catch (err) {
            console.error('Error fetching blog by ID:', err); // Log the error for debugging
            res.status(500).send({
                error: 'An error has occurred while fetching the blog'
            });
        }
    }
};
