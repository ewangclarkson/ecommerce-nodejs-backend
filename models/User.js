const app = require('../database/config/database');
const debug = require('debug')('app:dev');
const _ = require('lodash');
const config = require('config');
const jwt = require('jsonwebtoken');

class UserModel {

    constructor() {
        this.User = app.db.model('User',
            new app.db.Schema({
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
                        unique: true
                    },
                    password: {
                        type: String,
                        minLength: 5,
                        maxLength: 1024,
                        required: true
                    },
                    isAdmin: Boolean,
                },
                {
                    timestamps: {
                        createdAt: 'created_at',
                        updateAt: 'updated_at'
                    }
                }));
    }

    async createNewUser(userObject) {
        const user = new this.User(userObject);
        let resource = await user.save();
        return _.pick(resource, ['_id', 'name', 'username', 'isAdmin']);
    }


    async getUsers() {
        return await this.User.find()
            .select({_id: 1, name: 1, username: 1, isAdmin: 1});
    }


    async getUserById(id) {
        return _.pick(await this.User.findById(id), ['_id', 'name', 'username', 'isAdmin']);
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
        return  await this.User.deleteOne({_id: id});
    }


    async generateAuthToken(user) {
        return jwt.sign(user, config.get('auth.jwtTokenizer'),{expiresIn:'24h'});
    }
}

module.exports = UserModel;
