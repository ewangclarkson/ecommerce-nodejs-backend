const fs = require('fs');
const mongoose = require('mongoose');
const _ = require('underscore');

class PaymentModel {

    constructor() {
        const inventorySchema = new mongoose.Schema({
                product_name: {type: String, required: true},
                quantity: {type: Number, required: true},
                price: {type: Number, required: true},
                image: {type: String, required: true},
                description: {type: String, required: true},
                Products_id: {type: mongoose.Schema.Types.ObjectId, rel: "Product"},
            },
            {

                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            }
        );
        this.Inventory = mongoose.model('Inventory', inventorySchema);

        const paymentSchema = new mongoose.Schema({
                name: {type: String, required: true},
                email: {type: String, required: true},
                location: {type: String, required: true},
                amount: {type: Number, required: true},
                phone: {type: String, required: true},
                transaction_id:{type:String,required:true},
                code: {type: String, required: true},
                inventory: [{type: inventorySchema, required: true}],
                status: {type: Number, required: true, default: 0},
            },
            {
                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            });

        this.Payment = mongoose.model('Payment', paymentSchema);
    }

    async createNewPayment(paymentObject) {
        const payment = new this.Payment(paymentObject);
        return payment.save();
    }

    async createNewInventory(inventoryObject) {
        const inventory = new this.Inventory(inventoryObject);
        return inventory.save();
    }

    async createNewInventories(inventoryArray) {
        return await this.Inventory.insertMany(inventoryArray);
    }


    async getPaymentById(id) {
        return this.Payment.findById(id);
    }

    async getStatefulPayments(state) {
        return this.Payment.find({status: state});
    }

    async getPayments() {
        return this.Payment.find();
    }


    async updatePayment(id, paymentObject) {
        const payment = await this.getPaymentById(id);
        if (payment) {
            this.bulkDeleteInventory(payment.inventory);
        }

        return this.Payment.findByIdAndUpdate({_id: id}, {
            $set: paymentObject
        }, {new: true});
    }

    async deleteInventoryId(id) {
        return await this.Inventory.deleteOne({_id: id});
    }

    async bulkDeleteInventory(inventories) {
        for (const inventory of inventories) {
            await this.deleteInventoryId(inventory._id);
        }
    }

    async deletePayment(id) {
        const payment = await this.getPaymentById(id);
        if (payment) {
            this.bulkDeleteInventory(payment.inventory);
        }
        return await this.Payment.deleteOne({_id: id});
    }
}

module.exports = PaymentModel;
