const _ = require('lodash');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const User = require('../models/User');


class UserController {
    constructor() {
        this.saltRounds = 10;
        this.userModel = new User();
    }

    authenticateUser() {
        return async (req, resp) => {
            let error = this.validateAuthUser(req.body);
            if (error) return resp.status(400).send(error.message); //not found
            const auth = await this.userModel.getUserByUsername(req.body.username);

            if (_.isEmpty(auth)) return resp.status(400).send("invalid username or password");

            const authCheck = await bcrypt.compare(req.body.password, auth.password);
            if (!authCheck) return resp.status(400).send("invalid username or password");

            const token = await this.userModel.generateAuthToken(_.pick(auth, ['_id', 'name', 'username', 'isAdmin']));

            return resp.header('x-auth-token', token).send(_.pick(auth, ['_id', 'name', 'username', 'isAdmin']));

        }
    }


    getUsers() {
        return async (req, res) => {
            const users = await this.userModel.getUsers();
            return res.status(200).send(users);
        }
    }

    getUser() {
        return async (req, res) => {
            let user = await this.userModel.getUserById(req.params.id);

            if (_.isEmpty(user)) return res.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found

            return res.status(200).send(user);

        }
    }
    createUser() {
        return async (req, resp) => {
            let error = this.validateRequest(req.body);
            if (error) return resp.status(400).send(error.message); //not found
            let eUser = await this.userModel.getUserByUsername(req.body.username);

            if (!(_.isEmpty(eUser))) return resp.status(400).send(`A user with username ${req.body.username} already exist`);
            const password = await this.encodePassword(req.body.password);
            const user = {
                name: req.body.name,
                username: req.body.username,
                password: password,
                isAdmin: req.body.isAdmin
            };
            const newUser = await this.userModel.createNewUser(user);
            return resp.status(201).send(_.pick(newUser, ['_id', 'name', 'username', 'isAdmin']));

        }
    }

    getAuthUser() {
        return async (req, res) => {
            const user = await this.userModel.getUserById(req.user._id);
            if (_.isEmpty(user)) return res.status(404).send(`user not found`); //not found

            return res.status(200).send(user);

        }
    }

    deleteUser() {
        return async (req, resp) => {
            const user = await this.userModel.getUserById(req.params.id);
            if (_.isEmpty(user)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            await this.userModel.deleteUser(req.params.id);
            return resp.status(200).send('user deleted');

        }
    }

    updateUser() {
        return async (req, resp) => {
            //  let error = this.validateUpdateUserRequest(req.body);
            if (_.isEmpty(req.body)) return resp.status(400).send('bad request'); //not found
            const c = await this.userModel.getUserById(req.params.id);
            if (_.isEmpty(c)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            let user = this.userModel.updateUser(req.params.id, req.body);
            return resp.status(200).send(user);

        }
    }

    resetUserPassword() {
        return async (req, resp) => {
            const user = await this.userModel.getUserById(req.params.id);
            if (_.isEmpty(user)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            const password = this.generateRandomString(8);
            await this.userModel.updateUser(req.params.id, {
                password: await this.encodePassword(password),
            });
            return resp.status(200).send({
                password: password,
            });

        }
    }

    changeUserPassword() {
        return async (req, resp) => {
            const user = await this.userModel.getUserByIdWithPassword(req.params.id);
            if (_.isEmpty(user)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found

            const error = this.validateUserPassword(req.body);
            if(error)return resp.status(400).send(error.message); //not found

            const passwordCheck = await bcrypt.compare(req.body.oldPassword,user.password);
            if (!passwordCheck) return resp.status(400).send("Invalid old password ");


            const password =await this.encodePassword(req.body.password);
            await this.userModel.updateUser(req.params.id, {
                password: password
            });
            return resp.status(200).send({
                password: req.body.password,
            });

        }
    }

    generateRandomString(length) {
        var result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    async encodePassword(password) {
        return await bcrypt.hash(password, this.saltRounds);

    }


    validateRequest(user) {
        let schema = Joi.object({
            name: Joi.string().min(5).max(55).required(),
            username: Joi.string().email().min(5).max(255).required(),
            password: Joi.string().min(5).max(255).required(),
            isAdmin: Joi.boolean().required(),
        });

        const {error} = schema.validate(user);

        return error;
    }

    validateUpdateUserRequest(user) {
        let schema = Joi.object({
            name: Joi.string().min(5).max(55).required(),
            isAdmin: Joi.boolean().required(),
        });

        const {error} = schema.validate(user);

        return error;
    }

    validateAuthUser(user) {
        let schema = Joi.object({
            username: Joi.string().email().min(5).max(255).required(),
            password: Joi.string().min(5).max(255).required(),
        });

        const {error} = schema.validate(user);

        return error;
    }

    validateUserPassword(user) {
        let schema = Joi.object({
            oldPassword: Joi.string().min(5).max(255).required(),
            password: Joi.string().min(5).max(255).required(),
        });

        const {error} = schema.validate(user);

        return error;
    }

}

module.exports = new UserController();