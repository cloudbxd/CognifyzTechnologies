const express = require('express');
const router = express.Router();

let formData = [];

router.get('/data', (req, res) => {
    res.json(formData);
});

router.post('/data', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required!' });
    }
    formData.push({ name, email });
    res.status(201).json({ message: 'Data added successfully' });
});

router.delete('/data/:email', (req, res) => {
    const { email } = req.params;
    formData = formData.filter(item => item.email !== email);
    res.status(200).json({ message: 'Data deleted successfully' });
});

module.exports = router;
