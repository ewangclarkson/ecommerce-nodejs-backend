const _ = require('underscore');
let Joi = require('joi');
const product = require('./ProductController');
Joi.objectId = require('joi-objectid')(Joi);
const Payment = require('../models/Payment');
const config = require('config');
const momo = require('mtn-momo');

const {Collections} = momo.create({
    callbackHost: "http://localhost:8089"
});

class PaymentController {

    constructor() {
        this.paymentModel = new Payment();
    }

    getPayments() {
        return async (req, res) => {
            const payments = await this.paymentModel.getPayments();
            return res.status(200).send(payments);
        }
    }

    getPayment() {
        return async (req, res) => {
            const payment = await this.paymentModel.getPaymentById(req.params.id);
            if (_.isEmpty(payment)) return res.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            return res.status(200).send(payment);
        }
    }

    deletePayment() {
        return async (req, resp) => {
            const payment = await this.paymentModel.getPaymentById(req.params.id);
            if (_.isEmpty(payment)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            await this.paymentModel.deletePayment(req.params.id);
            return resp.status(200).send(payment);

        }
    }

    updatePayment() {
        return async (req, resp) => {
            //if (this.validateRequest(req.body)) return resp.status(404).send('bad request'); //not found
            const c = await this.paymentModel.getPaymentById(req.params.id);
            if (_.isEmpty(c)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            if (!_.isEmpty(req.body.inventory)) {
                req.body.inventory = await this.paymentModel.createNewInventories(req.body.inventory);
            }
            let payment = await this.paymentModel.updatePayment(req.params.id, req.body);
            return resp.status(200).send(payment);
        }
    }

    generateRandomCode(length) {
        var result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    createPayment() {
        return async (req, resp) => {
            const error = this.validateRequest(req.body);
            if (error) return resp.status(404).send(error.message); //not found
            //Start momo payment transaction
           const collections = Collections({
                userSecret: config.get('momo.collectionsUserSecret'),
                userId: config.get('momo.collectionsUserId'),
                primaryKey: config.get('momo.collectionsPrimaryKey')
            });
            const externalId = Math.random().toString(36).slice(2);
            const transactionId = await collections.requestToPay({
                amount: req.body.amount,
                currency: "EUR",
                externalId: externalId,
                payer: {
                    partyIdType: "MSISDN",
                    partyId: req.body.phone
                },
                payerMessage: "Payment by " + req.body.name,
                payeeNote: "email:" + req.body.email + ' payments for ' + req.body.inventory.length + ' products'
            });
            const transaction = await collections.getTransaction(transactionId);
            if (transaction.status === 'SUCCESSFUL') {

                const inventory = await this.paymentModel.createNewInventories(req.body.inventory);
                const paymentRecord = {
                    name: req.body.name,
                    email: req.body.email,
                    location: req.body.location,
                    amount: req.body.amount,
                    phone: req.body.phone,
                    transaction_id: transactionId,
                    code: this.generateRandomCode(4),
                    inventory: inventory,
                };

                const payment=await this.paymentModel.createNewPayment(paymentRecord);
                await product.updateProductQuantityBasedOnInventory(inventory);
                return resp.status(201).send({
                    transactionId
                });
           } else {
                return resp.status(400).send('payment failed please try again later');
            }
        }
    }

    getStatefulPayments() {
        return async (req, res) => {
            const state = req.params.state;
            const payments = await this.paymentModel.getStatefulPayments(state);
            return res.status(200).send(payments);
        }
    }

    validateRequest(payment) {
        let schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            location: Joi.string().required(),
            amount: Joi.number().required(),
            phone: Joi.string().min(9).max(13).required(),
            inventory: Joi.array().required(),
        });

        const {error} = schema.validate(payment);

        return error;
    }

}

module.exports = new PaymentController();