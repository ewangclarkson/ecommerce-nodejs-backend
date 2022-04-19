const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('config');
const jwt = require('jsonwebtoken');

class UserModel {

    constructor() {
        let userSchema =new mongoose.Schema({
                name: {
                    type: String,
                    required: true,
                    minLength: 5,
                    maxLength: 50
                },
                username: {
                    type: String,
                    required: true,
                    minLength: 5,
                    maxLength: 255,
                    // unique: true
                },
                password: {
                    type: String,
                    minLength: 5,
                    maxLength: 1024,
                    required: true
                },
                isAdmin:{
                    type:Boolean,
                    required:true
                },
            },
            {
                timestamps: {
                    createdAt: 'created_at',
                    updateAt: 'updated_at'
                }
            });

        this.User = mongoose.model('User',userSchema);
    }

    async createNewUser(userObject) {
        const user = new this.User(userObject);
        return  user.save();
    }


    async getUsers() {
        return this.User.find()
            .select({_id: 1, name: 1, username: 1, isAdmin: 1});
    }


    async getUserById(id) {
        return _.pick(await this.User.findById(id), ['_id', 'name', 'username', 'isAdmin']);
    }

    async getUserByIdWithPassword(id) {
        const user  =await this.User.findOne({_id:id});
        return _.pick(user,['_id', 'name', 'username','password', 'isAdmin']);
    }

    async getUserByUsername(username) {
        let user = await this.User.findOne({username: username});
        return _.pick(user, ['_id', 'name', 'username', 'password', 'isAdmin']);
    }


    async updateUser(id, userObject) {
        const resource = await this.User.findByIdAndUpdate({_id: id}, {
            $set: userObject
        }, {new: true});
        return _.pick(resource, ['_id', 'name', 'username', 'isAdmin']);
    }


    async deleteUser(id) {
        return this.User.deleteOne({_id: id});
    }


    async generateAuthToken(user) {
        return jwt.sign(user, config.get('auth.jwtTokenizer'),{expiresIn:'5h'});
    }
}

module.exports = UserModel;
