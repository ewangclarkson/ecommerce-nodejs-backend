const mongoose = require('mongoose');


class SubCategoryModel {

    constructor() {
        this.subCategory = mongoose.model('SubCategory',
            new mongoose.Schema({
                    subcategory_name: {type: String, required: true},
                    Categories_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        rel: "Category"
                    }
                },
                {
                    timestamps: {
                        createdAt: 'created_at',
                        updateAt: 'updated_at'
                    }
                },
                {
                    toJSON: {virtuals: true},
                    toObject: {virtuals: true}
                }));
    }

    async createNewSubCategory(categoryObject) {
        const category = new this.subCategory(categoryObject);
        return category.save();
    }


    async getSubCategories() {
        return await this.subCategory.find();

    }


    async getSubCategoryById(id) {
        return this.subCategory.findById(id);
    }

    async updateSubCategory(id, categoryObject) {
        return this.subCategory.findByIdAndUpdate({_id: id}, {
            $set: categoryObject
        }, {new: true});
    }


    async deleteSubCategory(id) {
        return await this.subCategory.deleteOne({_id: id});
    }
}

module.exports = SubCategoryModel;
