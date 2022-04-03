const app = require('../database/config/database');
const fs = require('fs');
const path = require('path');
const debug = require('debug')('app:dev');
const _ = require('underscore');

class ProductModel {

    constructor() {
        const imageSchema = new app.db.Schema({
                filename: {type: String, required: true},
                path: {type: String, required: true},
            },
            {
                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            });
        this.Image = app.db.model('Image', imageSchema);

        const productSchema = new app.db.Schema({
                product_name: {type: String, required: true},
                brand: {type: String, required: true},
                price: {type: Number, required: true},
                sizes: [{type: String, required: true}],
                quantity: {type: Number, required: true},
                description: {type: String, required: true},
                images: [{type: imageSchema, required: true}]
            },
            {
                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            });

        this.Product = app.db.model('Product', productSchema);
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


    async getProductById(id) {
        return this.Product.findById(id);
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
