const app = require('../database/config/database');
const debug = require('debug')('app:dev');

class CategoryModel {

    constructor() {
        const categorySchema = new app.db.Schema({
                category_name: {type: String, required: true},
            },
            {
                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            }, {
                toJSON: {virtuals: true},
                toObject: {virtuals: true}
            });
        //create relationship
        categorySchema.virtual('subCategories', {
            ref: 'SubCategory',
            localField: '_id',
            foreignField: 'Categories_id',
        });
        this.Category = app.db.model('Category', categorySchema);
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
