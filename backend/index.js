const express = require('express');
const app = express();
const cors = require('cors');
const userRoute = require('./api/userRoutes');
const bodyfatRoute = require('./api/bodyfatRoutes');
const musclemassRoute = require('./api/musclemassRoutes');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sendResponse = require('./api/sendResponse');
const cmdLogger = require('./logger');
const pool = require('./api/config');

app.use(cors({
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true,
}));

app.use(cookieParser());

app.use(session({
    secret: 'A/P&u.:_OYD)k#F9',
    resave: false,
    saveUninitialized: true,
    cookie: {sameSite: 'Lax', httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24}
}));

//Routes
app.use('/users', userRoute);
app.use('/bodyfat', bodyfatRoute);
app.use('/musclemass', musclemassRoute);

app.get('/', (req, res) => {
    cmdLogger.info('Inside GET /');
    sendResponse(res, 200, "Success", (req.session.user) ? req.session.user : {});
})

const server = app.listen(3000, () => cmdLogger.info("Server running on PORT 3000"));

process.on('SIGINT', () => {
    cmdLogger.warn('Server process interrupted');
    cmdLogger.info('Shutting down server...');

    //Close the connections in db pool
    pool.end((err) => {
        if (err) {
            cmdLogger.error('Error closing the database pool: ', err);
        }

        else {
            cmdLogger.info('Database pool closed successfully');
        }
    });

    //Close server
    server.close((err) => {
        if (err) {
            cmdLogger.error('Error closing server', err);
        }

        else {
            cmdLogger.info('Server closed gracefully');
        }
    });
});