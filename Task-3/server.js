const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let formData = [];

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/form', (req, res) => {
    res.render('form');
});

app.post('/submit', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).send('Name and email are required!');
    } else {
        formData.push({ name, email });
        res.send(`Name: ${name}, Email: ${email}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
