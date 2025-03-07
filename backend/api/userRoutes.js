const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const pool = require('./config');
const sendResponse = require('./sendResponse');
const util = require('util');
const poolQuery = util.promisify(pool.query).bind(pool);
const cmdLogger = require('../logger');
const { request } = require('http');

const table = 'Users';

const router = express.Router();

router.use(bodyParser.json());

router.use(bodyParser.urlencoded({extended: true}));


router.post('/register', async (req, res) => {
    cmdLogger.info('Inside POST /users/register');

    if (req.session.user) {
        cmdLogger.warn('User already logged in');

        return sendResponse(res, 400, 'User already logged in');
    }

    var userInfo = req.body;

    if (!userInfo.username || !userInfo.password) {
        cmdLogger.warn('Username or password not part of request body');
        sendResponse(res, 400, "Enter username and password");
    }
    else {

        try {
            const results = await poolQuery(`SELECT * FROM ${table} WHERE username = ?;`, [userInfo.username]);

            if (results.length == 0) {
                const hashedPassword = await bcrypt.hash(userInfo.password, 10);

                try {
                    const results  = await poolQuery(`INSERT INTO ${table} VALUES (?, ?);`, [userInfo.username, hashedPassword]);
                    cmdLogger.info('Insert successful: ', results.insertId);
                    sendResponse(res, 200, "New user created", results.insertId);
                } catch (err) {
                    cmdLogger.error('Error inserting new user: ', err);
                    sendResponse(res, 400, "DB Error");
                }
            }

            else {
                cmdLogger.warn('Username already exists');
                sendResponse(res, 400, "username already exists");
            }

        } catch (err) {
            sendResponse(res, 400, "DB Error")
        }
    }
});

router.post('/login', async (req, res) => {
    cmdLogger.info('Inside POST /users/login');

    if (req.session.user) {
        cmdLogger.warn('User already logged in');
        return sendResponse(res, 400, 'User already logged in');
    }

    var userInfo = req.body;

    if (!userInfo.username || !userInfo.password) {
        cmdLogger.warn('Username or password not part of request body');
        sendResponse(res, 400, "Enter username and password");
    }
    else {

        try {
            const results = await poolQuery(`SELECT * FROM ${table} WHERE Username = ?;`, [req.body.username]);

            if(results.length === 1) {
                const hashedPassword = results[0].password;
                const isMatch = await bcrypt.compare(userInfo.password, hashedPassword);

                if (isMatch) {
                    req.session.user = {username: userInfo.username};
                    cmdLogger.info('User authenticated');
                    sendResponse(res, 200, "Authenticated", req.session.user);
                 }
                 else {
                    cmdLogger.warn('Invalid credentials');
                    sendResponse(res, 400, "Invalid username or password");
                 }
            }

            else {
                cmdLogger.warn('Invalid credentials');
                sendResponse(res, 400, "Invalid username or password");
            }
        } catch (err) {
            cmdLogger.error('Error retreiving requested data from table: ', err);
            sendResponse(res, 400, "DB Error");
        }

    }
});

router.post('/update', async (req, res) => {
    cmdLogger.info('Inside POST /users/update');
    var userInfo = req.body;

    if (!userInfo.username || !userInfo.old_password || !userInfo.new_password) {
        cmdLogger.warn('Username or password not part of request body');
        sendResponse(res, 400, "Please provide username and password");
    }
    else {
        try {
            const results = await poolQuery(`SELECT * FROM ${table} WHERE username = ?`, [userInfo.username]);

            if (results.length == 1) {
                try {
                    const isMatch = await bcrypt.compare(userInfo.old_password, results[0].password);

                    if (isMatch) {
                        try {
                            const hashedPassword = await bcrypt.hash(userInfo.new_password, 10);
                            
                            try {
                                const results = await poolQuery(`UPDATE ${table} SET password = ? WHERE username = ?;`, [hashedPassword, userInfo.username]);

                                //Destroy session after credential is updated
                                if (req.session.user) {
                                    req.session.destroy((err) => {
                                        if (err) {
                                            cmdLogger.error('Error destroying session: ', err);
                                            return sendResponse(res, 400, 'Error logging out');
                                        }
                                    });
                                }
                                cmdLogger.info('Table data updated successfully');
                                sendResponse(res, 200, "Password updated successfully", results.insertId);
                            } catch (err) {
                                cmdLogger.error('Error updated table data');
                                sendResponse(res, 400, "DB Error");
                            }
                        } catch (err) {
                            cmdLogger.error('Error hashing new password');
                            sendResponse(res, 400, "bcrypt error");
                        }
                    }

                    else {
                        cmdLogger.warn('Incorrect username or password');
                        sendResponse(res, 400, "Incorrect username or password");
                    }

                } catch (err) {
                    cmdLogger.error('Error comparing credentials: ', err);
                    sendResponse(res, 400, "bcrypt error");
                }
            }

            else {
                cmdLogger.writable('Incorrect username or password');
                sendResponse(res, 400, "Incorrect username or password");
            }
        } catch (err) {
            cmdLogger.error('Error retreiving data from table');
            sendResponse(res, 400, "DB Error");
        }

    }
});

router.get('/logout', (req, res) => {
    cmdLogger.info('Inside GET /users/logout');
    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                cmdLogger.error('Error destroying session');
                return sendResponse(res, 400, 'Error logging out');
            }

            res.clearCookie('connect.sid');
            cmdLogger.info('session cookie cleared');
            cmdLogger.info('Logged out successfully');
            return sendResponse(res, 200, 'Logged out successfully');
        });
    }

    else {
        cmdLogger.warn('No user logged in');
        sendResponse(res, 400, 'No user logged in');
    }
});

module.exports = router;