const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const sendResponse = require('./sendResponse');
const pool = require('./config');
const util = require('util');
const poolQuery = util.promisify(pool.query).bind(pool);
const cmdLogger = require('../logger');

const table = 'MuscleMass';

router.use(bodyParser.json());

router.use(bodyParser.urlencoded({extended: true}));

//FOR TESTING PURPOSES ONLY (DELETE AFTERWARDS)
router.get('/', async (req, res) => {
    cmdLogger.info('Inside GET /musclemass/');

    if (!req.session.user) {
        cmdLogger.warn('No user logged in');
        return sendResponse(res, 400, 'User is not logged in');
    }

    try {
        const results = await poolQuery(`SELECT timestamp AS date, value AS musclemass FROM ${table} WHERE username = ?;`, [req.session.user.username]);

        results.map((i) => {
            i.date = i.date.getFullYear() + "-" + (i.date.getMonth() + 1) + "-" + i.date.getDate();
        });

        sendResponse(res, 200, "Success", results);
    } catch (err) {
        sendResponse(res, 400, "DB Error");
    }
});

router.post('/change', async (req, res) => {
        if (!req.session.user) {
        cmdLogger.warn('No user logged in');
        return sendResponse(res, 400, 'User is not logged in');
    }

    var userInfo = req.body;

    if (!userInfo.musclemass || !userInfo.date) {
        cmdLogger.warn('muclemass and date not part of request body');
        sendResponse(res, 400, "Enter muscle mass and date");
    }
    else {
        try {
            const results = await poolQuery(`UPDATE ${table} SET value = ? WHERE username = ? AND timestamp = ?;`, [userInfo.musclemass, req.session.user.username, userInfo.date]);

            cmdLogger.info('Updated table entry successfully');
            sendResponse(res, 200, "Updated entry successfully");
        } catch (err) {
            cmdLogger.error('Error updating table entry');
            sendResponse(res, 400, "DB Error");
        }

    }
});

router.post('/add', async (req, res) => {
        if (!req.session.user) {
        cmdLogger.warn('No user logged in');
        return sendResponse(res, 400, 'User is not logged in');
    }

    var userInfo = req.body;
    const dateObj = new Date();
    const currDate = dateObj.getFullYear() + '-' + (dateObj.getMonth()+1) + '-' + dateObj.getDate();

    if (!userInfo.musclemass) {
        sendResponse(res, 400, "Enter muscle mass");
    }
    else {
        try {
            const results = await poolQuery(`INSERT INTO ${table} VALUES (?, ?, ?);`, [currDate, req.session.user.username, userInfo.musclemass]);

            sendResponse(res, 200, "Inserted entry successfully", {date: currDate, musclemass: userInfo.musclemass});
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                cmdLogger.warn('Cannot insert duplicate entry to table');
                sendResponse(res, 400, "This day's entry already exists for the user");
            }

            else {
                cmdLogger.error('Error inserting entry to the table');
                sendResponse(res, 400, "DB Error");
            }
        }

    }
});

router.delete('/delete', async (req, res) => {
    cmdLogger.info('Inside DELETE /musclemass/delete');
    if (!req.session.user) {
        cmdLogger.warn('No user logged in');
        return sendResponse(res, 400, 'User is not logged in');
    }

    var userInfo = req.body;

    if (!userInfo.date) {
        cmdLogger.warn('date not part of request body');
        sendResponse(res, 400, "Enter username and date");
    }
    else {
        try {
            const results = await poolQuery(`DELETE FROM ${table} WHERE timestamp=? AND username=?;`, [userInfo.date, req.session.user.username]);

            cmdLogger.info('Entry deleted successfully');
            sendResponse(res, 200, "Entry deleted successfully");
        } catch (err) {
            cmdLogger.error('Error deleting table entry', err);
            sendResponse(res, 400, "DB Error");
        }

    }
});

module.exports = router;