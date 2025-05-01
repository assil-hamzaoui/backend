const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Make sure to import jwt
const { signup, login, forgotPassword, resetPassword, handleFormSubmission } = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../Middleware/authMiddleware');


// Define routes
router.post('/form', handleFormSubmission);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
