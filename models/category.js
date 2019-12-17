const mongoose = require('mongoose');
//const collection = require('./collection');
const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        
    }
);
const categoryModel = mongoose.model('Category', categorySchema);
class Category {

    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static insert(new_category) {
            return new categoryModel(new_category).save();
    
    }
    static getAll(substring) {
        console.log(substring);
        return categoryModel.find({ name: { $regex: `(?i).*${substring}.*(?-i)` } });

}

    static getById(id) {
        return categoryModel.findById(id);
}

    static update(id, category) {
        return categoryModel.findByIdAndUpdate(id, {name: category.name,});
}

    static deleteById(id) {
        return categoryModel.findByIdAndRemove(id);
    

}

};
module.exports = Category;