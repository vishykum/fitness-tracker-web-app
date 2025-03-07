const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const sendResponse = require('./sendResponse');
const pool = require('./config');
const util = require('util');
const poolQuery = util.promisify(pool.query).bind(pool);
const cmdLogger = require('../logger');

const table = 'Bodyfat';

router.use(express.json());
router.use(bodyParser.json());

router.use(bodyParser.urlencoded({extended: true}));

router.get('/', async (req, res) => {
    cmdLogger.info('Inside GET /bodyfat/');

    if (!req.session.user) {
        cmdLogger.warn('No user logged in');
        return sendResponse(res, 400, 'User is not logged in');
    }

    try {
        const results = await poolQuery(`SELECT timestamp AS date, value AS bodyfat FROM ${table} WHERE username = ?;`, [req.session.user.username]);

        results.map((i) => {
            i.date = i.date.getFullYear() + "-" + (i.date.getMonth() + 1) + "-" + i.date.getDate();
        });

        sendResponse(res, 200, "Success", results);
    } catch (err) {
        cmdLogger.error("DB Error", err);
        sendResponse(res, 400, "DB Error");
    }
});

router.post('/change', async (req, res) => {
    cmdLogger.info('Inside POST /bodyfat/change');
    if (!req.session.user) {
        cmdLogger.warn('No user logged in');
        return sendResponse(res, 400, 'User is not logged in');
    }

    var userInfo = req.body;

    if (!userInfo.bodyfat || !userInfo.date) {
        cmdLogger.warn('bodyfat and date are not part of request body');
        sendResponse(res, 400, "Enter bodyfat percentage and date");
    }
    else {
        try {
            const results = await poolQuery(`UPDATE ${table} SET value = ? WHERE username = ? AND timestamp = ?;`, [userInfo.bodyfat, req.session.user.username, userInfo.date]);

            cmdLogger.info('Updated table data successfully');
            sendResponse(res, 200, "Inserted entry successfully");
        } catch (err) {
                cmdLogger.error('Error updating table data: ', err);
                sendResponse(res, 400, "DB Error");
        }

    }
});

router.post('/add', async (req, res) => {
    cmdLogger.info('Inside POST /bodyfat/add');
        if (!req.session.user) {
        cmdLogger.warn('No user logged in');
        return sendResponse(res, 400, 'User is not logged in');
    }

    var userInfo = req.body;
    const dateObj = new Date();
    const currDate = dateObj.getFullYear() + '-' + (dateObj.getMonth()+1) + '-' + dateObj.getDate();

    if (!userInfo.bodyfat) {
        cmdLogger.warn('bodyfat not part of request body');
        sendResponse(res, 400, "Enter bodyfat percentage");
    }
    else {
        try {
            const results = await poolQuery(`INSERT INTO ${table} VALUES (?, ?, ?);`, [currDate, req.session.user.username, userInfo.bodyfat]);

            cmdLogger.info('Inserted entry to table successfully');
            sendResponse(res, 200, "Inserted entry successfully", {date: currDate, bodyfat: userInfo.bodyfat});
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                cmdLogger.warn('Cannot insert duplicate entry to table');
                sendResponse(res, 400, "This day's entry already exists for the user");
            }

            else {
                cmdLogger.error('Error inserting entry to table: ', err);
                sendResponse(res, 400, "DB Error");
            }
        }

    }
});

router.delete('/delete', async (req, res) => {
    cmdLogger.info('Inside DELETE /bodyfat/delete');
        if (!req.session.user) {
        cmdLogger.warn('No user logged in');
        return sendResponse(res, 400, 'User is not logged in');
    }

    var userInfo = req.body;
    cmdLogger.debug(JSON.stringify(req.body));

    if (!userInfo.date) {
        cmdLogger.warn('username and date not part of request body');
        sendResponse(res, 400, "Enter username and date");
    }
    else {
        try {
            const results = await poolQuery(`DELETE FROM ${table} WHERE timestamp=? AND username=?;`, [userInfo.date, req.session.user.username]);

            cmdLogger.info('Entry deleted successfully');
            sendResponse(res, 200, "Success");
        } catch (err) {
            cmdLogger.error('Error deleting entry: ', err);
            sendResponse(res, 400, "DB Error");
        }

    }
});

module.exports = router;