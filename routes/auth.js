const express = require('express');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const User = require('../models/user');
const ExpressError = require('../expressError');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function(req, res, next){
    try{
        let { username, password } = req.body;
        let isAuthenticated = await User.authenticate(username, password);
        if(!isAuthenticated){
            return res.status(400).json({message: "Invalid credentials"});
        }

        // If authentication successful, create token
        let token = jwt.sign({ username }, SECRET_KEY);
        await User.updateLoginTimestamp(username);
        return res.json({ token });
    }catch(err){
        return res.status(500).json({ error : err.message });
    }
});



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next){
    try{
        const user = await User.register(req.body);
        const token = jwt.sign({ username: user.username }, SECRET_KEY);
        await User.updateLoginTimestamp(user.username);
        return res.status(201).json({ token });
    }catch(err){
        if(err.code === "23505"){
            throw new ExpressError("Username taken", 400);
        }
        return next(err);
    }
});


module.exports = router;