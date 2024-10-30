const express = require('express');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const User = require('../models/user');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function(req, res, next){
    try{
        let { username, password } = req.body;
        let user = await User.authenticate(username, password);
        let token = jwt.sign({ username }, SECRET_KEY);
        user.last_login_at = new Date();
        await user.save();
        return res.json({ token });
    }catch(err){
        return next(err);
    }
})



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next){
    try{
        let { username, password, first_name, last_name, phone } = req.body;
        let user = await User.register({ username, password, first_name, last_name, phone });
        let token = jwt.sign({ username }, SECRET_KEY);
        user.last_login_at = new Date();
        await user.save();
        return res.json({ token });
    }catch(err){
        return next(err);
    }
});


module.exports = router;