module.exports = (sequelize, DataTypes) => {
    const Blog = sequelize.define('Blog', {
        
        thumbnail: DataTypes.STRING,
        pictures: DataTypes.TEXT,
        content: DataTypes.TEXT,
        category: DataTypes.STRING,     
        status: DataTypes.STRING,
        PartName: DataTypes.TEXT,
        Price: DataTypes.INTEGER
        
    })
    return Blog
}