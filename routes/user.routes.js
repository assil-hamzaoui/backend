const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken') 
const userController = require('../controllers/userController');
const authMiddleware = require('../Middleware/authMiddleware');
router.get('/profile', authMiddleware, userController.getProfile);
router.post('/logout', userController.logout);


module.exports = router;