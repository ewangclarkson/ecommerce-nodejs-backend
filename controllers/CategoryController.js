const _ = require('underscore');
const Joi = require('joi');
const Category = require('../models/Category');


class CategoryController {

    constructor() {
        this.categoryModel = new Category();
    }

    getCategories() {
        return async (req, res) => {
            let populate = parseInt(req.query.populate);
            const categories = populate ==1?await this.categoryModel.getCategoriesWithPopulation() : await this.categoryModel.getCategories();
            return res.status(200).send(categories);
        }
    }

    getCategory() {
        return async (req, res) => {
            const category = await this.categoryModel.getCategoryById(req.params.id);
            if (_.isEmpty(category)) return res.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            return res.status(200).send(category);
        }
    }


    deleteCategory() {
        return async (req, resp) => {
            const category = await this.categoryModel.getCategoryById(req.params.id);
            if (_.isEmpty(category)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            await this.categoryModel.deleteCategory(req.params.id);
            return resp.status(200).send(category);

        }
    }

    updateCategory() {
        return async (req, resp) => {
            if (this.validateRequest(req.body)) return resp.status(404).send('bad request'); //not found
            const c = await this.categoryModel.getCategoryById(req.params.id);
            if (_.isEmpty(c)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            let category = await this.categoryModel.updateCategory(req.params.id, req.body);
            return resp.status(200).send(category);
        }
    }

    createCategory() {
        return async (req, resp) => {
            if (this.validateRequest(req.body)) return resp.status(404).send('bad request'); //not found
            let category = await this.categoryModel.createNewCategory(req.body);
            return resp.status(201).send(category);
        }
    }

    validateRequest(category) {
        let schema = Joi.object({
            category_name: Joi.string().required(),
        });

        const {error} = schema.validate(category);

        return error;
    }

}

module.exports = new CategoryController();