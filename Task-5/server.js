const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/form', (req, res) => {
    res.render('form');
});

app.post('/submit', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).send('Name, email, and password are required!');
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        res.status(400).send('Password must be at least 8 characters long and contain a mix of letters and numbers.');
    } else {
        res.redirect('/');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
