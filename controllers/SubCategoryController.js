const _ = require('underscore');
let Joi = require('joi');
let SubCategory = require('../models/SubCategory');


Joi.objectId = require('joi-objectid')(Joi);


class SubCategoryController {

    constructor() {
        this.subCategoryModel = new SubCategory();
    }

    getSubCategories() {
        return async (req, res) => {
            const categories = await this.subCategoryModel.getSubCategories();
            return res.status(200).send(categories);
        }
    }


    getSubCategory() {
        return async (req, res) => {
            const subcategory = await this.subCategoryModel.getSubCategoryById(req.params.id);
            if (_.isEmpty(subcategory)) return res.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            return res.status(200).send(subcategory);
        }
    }


    deleteSubCategory() {
        return async (req, resp) => {
            const subcategory = await this.subCategoryModel.getSubCategoryById(req.params.id);
            if (_.isEmpty(subcategory)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            await this.subCategoryModel.deleteSubCategory(req.params.id);
            return resp.status(200).send(subcategory);
        }
    }

    updateSubCategory() {
        return async (req, resp) => {
            if (this.validateRequest(req.body)) return resp.status(404).send('bad request'); //not found
            const c = await this.subCategoryModel.getSubCategoryById(req.params.id);
            if (_.isEmpty(c)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            let subcategory = await this.subCategoryModel.updateSubCategory(req.params.id, req.body);
            return resp.status(200).send(subcategory);
        }
    }

    createSubCategory() {
        return async (req, resp) => {
            if (this.validateRequest(req.body)) return resp.status(404).send('bad request'); //not found
            let subcategory = await this.subCategoryModel.createNewSubCategory(req.body);
            return resp.status(201).send(subcategory);
        }
    }

    validateRequest(subcategory) {
        let schema = Joi.object({
            subcategory_name: Joi.string().required(),
            Categories_id:Joi.objectId,
        });

        const {error} = schema.validate(subcategory);

        return error;
    }

}

module.exports = new SubCategoryController();