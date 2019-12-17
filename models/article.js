const mongoose = require('mongoose');
//const collection = require('./collection');
const articleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        type: { type: String },
        pages: { type: Number },
        rating: { type: Date, default: Date.now },
        dataOfPublishing: { type: Number },
        fileurl:{type: String }
    }
);
const articleModel = mongoose.model('Article', articleSchema);
class Article {

    constructor(id, title, type, pages, rating, dataOfPublishing, fileurl) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.pages = pages;
        this.rating = rating;
        this.dataOfPublishing = dataOfPublishing;
        this.fileurl = fileurl;
    }

    static insert(file_url, new_article) {
       
            new_article.fileurl = file_url;
            console.log(new_article.fileurl);
            return new articleModel(new_article).save();
    

    }
    static getAll(substring) {
        return articleModel.find({ title: { $regex: `(?i).*${substring}.*(?-i)` } });

}

    static getById(id) {
        return articleModel.findById(id);
}

    static update(fileurl, id, article) {
        return articleModel.findByIdAndUpdate(id, {title: article.title, type: article.type, pages: article.pages, rating: article.rating, dataOfPublishing: article.dataOfPublishing, fileurl: fileurl});
}

    static deleteById(id) {
        return articleModel.findByIdAndRemove(id);
    

}

};
module.exports = Article;