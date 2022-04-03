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
            return resp.status(200).send(user);

        }
    }

    updateUser() {
        return async (req, resp) => {
            let error = this.validateRequest(req.body);
            if (error) return resp.status(400).send(error.message); //not found
            const c = await this.userModel.getUserById(req.params.id);
            if (_.isEmpty(c)) return resp.status(404).send(`The resource with id:${req.params.id} could not be found`); //not found
            let user = this.userModel.updateUser(req.params.id, req.body);
            return resp.status(200).send(user);

        }
    }

    createUser() {
        return async (req, resp) => {
            let error = this.validateRequest(req.body);
            if (error) return resp.status(400).send(error.message); //not found
            let eUser = await this.userModel.getUserByUsername(req.body.username);

            if (!(_.isEmpty(eUser))) return resp.status(400).send(`A user with username ${req.body.username} already exist`);
            let password = await this.encodePassword(req.body.password);
            let user = {
                name: req.body.name,
                username: req.body.username,
                password: password
            }
            let newUser = await this.userModel.createNewUser(user);
            return resp.status(201).send(newUser);

        }
    }

    async encodePassword(password) {
        return await bcrypt.hash(password, this.saltRounds);

    }


    validateRequest(user) {
        let schema = Joi.object({
            name: Joi.string().min(5).max(55).required(),
            username: Joi.string().email().min(5).max(255).required(),
            password: Joi.string().min(5).max(255).required(),
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

}

module.exports = new UserController();