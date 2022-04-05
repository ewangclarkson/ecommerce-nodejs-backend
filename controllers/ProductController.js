const _ = require('underscore');
let Joi = require('joi');
const Product = require('../models/Product');

Joi.objectId = require('joi-objectid')(Joi);


class ProductController {

    constructor() {
        this.productModel = new Product();
    }

    getProducts() {
        return async (req, res) => {
            const products = await this.productModel.getProducts();
            return res.status(200).send(products);
        }
    }

    getProduct() {
        return async (req, res) => {
            const product = await this.productModel.getProductById(req.params.id);
            if (_.isEmpty(product)) return res.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            return res.status(200).send(product);
        }
    }


    deleteProduct() {
        return async (req, resp) => {
            const product = await this.productModel.getProductById(req.params.id);
            if (_.isEmpty(product)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            await this.productModel.deleteProduct(req.params.id);
            return resp.status(200).send(product);

        }
    }

    updateProduct() {
        return async (req, resp) => {
            if (this.validateRequest(req.body)) return resp.status(404).send('bad request'); //not found
            const c = await this.productModel.getProductById(req.params.id);
            if (_.isEmpty(c)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            const images = req.files.map((item) => {
                return _.pick(item, ['filename', 'path']);
            });
            req.body.images = await this.productModel.createNewImages(images);
            let product = await this.productModel.updateProduct(req.params.id, req.body);
            return resp.status(200).send(product);
        }
    }

    createProduct() {
        return async (req, resp) => {
            if (this.validateRequest(req.body)) return resp.status(404).send('bad request'); //not found
            const images = req.files.map((item) => {
                return _.pick(item, ['filename', 'path']);
            });
            req.body.images = await this.productModel.createNewImages(images);
            let product = await this.productModel.createNewProduct(req.body);
            return resp.status(200).send(product);
        }
    }

    validateRequest(product) {
        let schema = Joi.object({
            product_name: Joi.string().required(),
            brand: Joi.string().required(),
            price: Joi.number().required(),
            sizes: Joi.array().required(),
            description: Joi.string().required(),
            quantity:Joi.number().required(),
            images: Joi.array(),
            SubCategories_id:Joi.objectId,
        });

        const {error} = schema.validate(product);

        return error;
    }

}

module.exports = new ProductController();