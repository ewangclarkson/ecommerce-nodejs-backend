const mongoose = require('mongoose');


class CategoryModel {

    constructor() {
        const categorySchema = new mongoose.Schema({
                category_name: {type: String, required: true},
            },
            {
                toJSON:{virtuals: true}
            },
            {
                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            });
        //create relationship
       categorySchema.virtual('subCategories', {
            ref: 'SubCategory',
            localField: '_id',
            foreignField: 'Categories_id',
        });
        this.Category = mongoose.model('Category', categorySchema);
    }

    async createNewCategory(categoryObject) {
        const category = new this.Category(categoryObject);
        return category.save();
    }


    async getCategories() {
        return await this.Category.find();

    }

    async getCategoriesWithPopulation() {
        return this.Category.find().populate('subCategories');

    }

    async getCategoryById(id) {
        return this.Category.findById(id);
    }

    async updateCategory(id, categoryObject) {
        return this.Category.findByIdAndUpdate({_id: id}, {
            $set: categoryObject
        }, {new: true});
    }


    async deleteCategory(id) {
        return await this.Category.deleteOne({_id: id});
    }
}

module.exports = CategoryModel;
