
///////////////////////////
// Page view routes
///////////////////////////

const express = require('express');
const router = express.Router();
const passport = require('passport'); // user authentication
const path = require('path');
const verify = require('../authentication/verify'); // check user permissions


// root index page
router.get('/', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/index.html');
    res.sendFile(dir);
});

// queue page
router.get('/queues', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/queues.html');
    res.sendFile(dir);
});

// maps page
router.get('/maps', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/maps.html');
    res.sendFile(dir);
});

// scorecard
router.get('/scorecard', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/scorecard.html');
    res.sendFile(dir);
});

// scorecard fields
router.get('/scorecard-admin', verify.isLoggedIn('admin'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/scorecard-admin.html');
    res.sendFile(dir);
});

// scheduling skill jobs
router.get('/skill', verify.isLoggedIn('admin'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/skill.html');
    res.sendFile(dir);
});

// Upload data
router.get('/upload', verify.isLoggedIn('admin'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/upload.html');
    res.sendFile(dir);
});

// admin panel
router.get('/admin', verify.isLoggedIn('admin'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/admin.html');
    res.sendFile(dir);
});

// login page for agent dashboard
router.get('/login', async (req, res) => {
    let dir = path.join(__dirname + '/../public/login.html');
    res.sendFile(dir);
});
// TODO: add error message
router.get('/login-retry', async (req, res) => {
    let dir = path.join(__dirname + '/../public/login.html');
    res.sendFile(dir);
});

// Post login credentials for dashboard
let loginSuccessRedirect = '/';
if (process.env.NODE_ENV == 'production') {
    loginSuccessRedirect = '/dashboard';
}
router.post('/login',
    passport.authenticate('local', { successRedirect: loginSuccessRedirect,
                                     failureRedirect: 'login-retry',
                                     failureFlash: false } )
);


module.exports = router;
