
const fs = require('fs');
const mongoose = require('mongoose');
const _ = require('underscore');

class ProductModel {

    constructor() {
        const imageSchema = new mongoose.Schema({
                filename: {type: String, required: true},
                path: {type: String, required: true},
            },
            {
                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            });
        this.Image = mongoose.model('Image', imageSchema);

        const productSchema = new mongoose.Schema({
                product_name: {type: String, required: true},
                brand: {type: String, required: true},
                price: {type: Number, required: true},
                sizes: [String],
                quantity: {type: Number, required: true},
                description: {type: String, required: true},
                images: [{type: imageSchema, required: true}],
                SubCategories_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    rel: "SubCategory"
                }
            },
            {
                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            });

        this.Product = mongoose.model('Product', productSchema);
    }

    async createNewProduct(productObject) {
        const product = new this.Product(productObject);
        return product.save();
    }

    async createNewImage(imageObject) {
        const image = new this.Image(imageObject);
        return image.save();
    }

    async createNewImages(imageArray) {
        return await this.Image.insertMany(imageArray);
    }

    async getProducts() {
        return await this.Product.find();

    }


    async getSubCategoryProducts(sId) {
        return await this.Product.find({SubCategories_id: sId});

    }


    async getProductById(id) {
        return this.Product.findById(id);
    }

    async updateProductAttr(id, productObject) {
        const product = await this.getProductById(id);
        return this.Product.findByIdAndUpdate({_id: id}, {
            $set: productObject
        }, {new: true});
    }

    async updateProduct(id, productObject) {
        const product = await this.getProductById(id);
        if (product) {
            this.bulkDeleteImages(product.images);
        }

        return this.Product.findByIdAndUpdate({_id: id}, {
            $set: productObject
        }, {new: true});
    }

    async deleteImageById(id) {
        return await this.Image.deleteOne({_id: id});
    }

    async bulkDeleteImages(images) {
        for (const image of images) {
            if (fs.existsSync(image.path)) {
                fs.unlinkSync(image.path)
            }
            await this.deleteImageById(image._id);
        }
    }

    async deleteProduct(id) {
        const product = await this.getProductById(id);
        if (product) {
            this.bulkDeleteImages(product.images);
        }
        return await this.Product.deleteOne({_id: id});
    }
}

module.exports = ProductModel;
