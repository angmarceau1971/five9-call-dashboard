///////////////////////////
// Page view routes
///////////////////////////

const express = require('express');
const router = express.Router();
const passport = require('passport'); // user authentication

const path = require('path');
const log = require('../utility/log');
const verify = require('../authentication/verify'); // check user permissions


// root index page
router.get('/', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/index.html');
    res.sendFile(dir);
});

// for backwards compatibility, send /dashboard route to index
router.get('/dashboard', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/index.html');
    res.sendFile(dir);
});

// queue page
router.get('/queues', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/queues.html');
    log.info(`page request from ${req.user.username}`, 'request',
                { username: req.user.username, route: 'queues' });
    res.sendFile(dir);
});

// maps page
router.get('/maps', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/maps.html');
    log.info(`page request from ${req.user.username}`, 'request',
                { username: req.user.username, route: 'maps' });
    res.sendFile(dir);
});

// scorecard
router.get('/scorecard', verify.isLoggedIn(), async (req, res) => {
    let dir = path.join(__dirname + '/../public/scorecard.html');
    log.info(`page request from ${req.user.username}`, 'request',
                { username: req.user.username, route: 'scorecard' });
    res.sendFile(dir);
});

// messenger
router.get('/message', verify.isLoggedIn('supervisor'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/message.html');
    log.info(`page request from ${req.user.username}`, 'request',
                { username: req.user.username, route: 'message' });
    res.sendFile(dir);
});

// scorecard field management
router.get('/scorecard-admin', verify.isLoggedIn('admin'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/scorecard-admin.html');
    log.info(`page request from ${req.user.username}`, 'request',
                { username: req.user.username, route: 'scorecard-admin' });
    res.sendFile(dir);
});

// scheduling skill jobs
router.get('/skill', verify.isLoggedIn('admin'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/skill.html');
    log.info(`page request from ${req.user.username}`, 'request',
                { username: req.user.username, route: 'skill' });
    res.sendFile(dir);
});

// Upload data
router.get('/upload', verify.isLoggedIn('admin'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/upload.html');
    log.info(`page request from ${req.user.username}`, 'request',
                { username: req.user.username, route: 'upload' });
    res.sendFile(dir);
});

// admin panel
router.get('/admin', verify.isLoggedIn('admin'), async (req, res) => {
    let dir = path.join(__dirname + '/../public/admin.html');
    log.info(`page request from ${req.user.username}`, 'request',
                { username: req.user.username, route: 'admin' });
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
router.post('/login',
    passport.authenticate('local', { successReturnToOrRedirect: '/',
                                     failureRedirect: 'login-retry',
                                     failureFlash: false } )
);
router.get('/logout', (req, res) => {
    log.message(`User ${req.user.username} logging out.`);
    req.logout();
    res.redirect('/');
});


module.exports = router;
