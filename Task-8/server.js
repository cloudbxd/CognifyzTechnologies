const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const NodeCache = require('node-cache');

const User = require('./models/User');
const cache = new NodeCache();

const app = express();

mongoose.connect('mongodb://localhost:27017/task8');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);

passport.use(new GitHubStrategy({
    clientID: 'YOUR_GITHUB_CLIENT_ID',
    clientSecret: 'YOUR_GITHUB_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
        user = new User({
            githubId: profile.id,
            name: profile.username,
            email: profile._json.email
        });
        await user.save();
    }
    done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

app.get('/auth/github',
    passport.authenticate('github'));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    });

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    const cachedData = cache.get('homeData');
    if (cachedData) {
        return res.render('index', cachedData);
    }

    const data = { message: 'Welcome to Task 8!' };
    cache.set('homeData', data, 600); // Cache for 10 minutes
    res.render('index', data);
});

app.get('/form', (req, res) => {
    res.render('form');
});

app.post('/submit', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required!');
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        return res.status(400).send('Password must be at least 8 characters long and contain a mix of letters and numbers.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Error saving user: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
