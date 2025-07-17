const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

let formData = [];

const authenticate = async (req, res, next) => {
    const { email, password } = req.headers;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.get('/data', authenticate, (req, res) => {
    res.json(formData);
});

router.post('/data', authenticate, (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required!' });
    }
    formData.push({ name, email });
    res.status(201).json({ message: 'Data added successfully' });
});

router.delete('/data/:email', authenticate, (req, res) => {
    const { email } = req.params;
    formData = formData.filter(item => item.email !== email);
    res.status(200).json({ message: 'Data deleted successfully' });
});

module.exports = router;
