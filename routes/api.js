const express = require('express');
const Route = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const fileMiddleWare = require('../middleware/file');//fileMiddleWare upload middleware
/**
 * Local Imports
 */
const SubCategoryController = require("../controllers/SubCategoryController");
const ProductController = require("../controllers/ProductController");
const CategoryController = require("../controllers/CategoryController");
const UserController = require('../controllers/UserController');


/**
 * Manage Categories
 */


Route.get('/subcategories', SubCategoryController.getSubCategories());
Route.get('/subcategories/:id', SubCategoryController.getSubCategory());
Route.post('/subcategories', [auth, admin], SubCategoryController.createSubCategory());
Route.put('/subcategories/:id', [auth, admin], SubCategoryController.updateSubCategory());
Route.delete('/subcategories/:id', [auth, admin], SubCategoryController.deleteSubCategory());

/**
 * Manage Subcategories
 */

Route.get('/categories', CategoryController.getCategories());
Route.get('/categories/:id', CategoryController.getCategory());
Route.post('/categories', [auth, admin], CategoryController.createCategory());
Route.put('/categories/:id', [auth, admin], CategoryController.updateCategory());
Route.delete('/categories/:id', [auth, admin], CategoryController.deleteCategory());

/**
 * Manage Products
 */
Route.get('/products', ProductController.getProducts());
Route.get('/products/:id', ProductController.getProduct());
Route.post('/products', [auth, admin,fileMiddleWare.array('images',4)], ProductController.createProduct());
Route.put('/products/:id', [auth, admin,fileMiddleWare.array('images',4)], ProductController.updateProduct());
Route.delete('/products/:id', [auth, admin], ProductController.deleteProduct());

/**
 * Manage User
 */
Route.get('/me', auth, UserController.getAuthUser());
Route.get('/users', [auth, admin], UserController.getUsers());
Route.get('/users/:id', [auth, admin], UserController.getUser());
Route.post('/users', [auth, admin], UserController.createUser());
Route.put('/users/:id', [auth, admin], UserController.updateUser());
Route.delete('/users/:id', [auth, admin], UserController.deleteUser());
Route.post('/login', UserController.authenticateUser());

module.exports = Route;