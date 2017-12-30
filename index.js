'use strict';

const moment = require('moment');
const format = require('string-format');
require('dotenv').config();

const mongoClient = require('./libs/mongodb');
const mongoUtil = require('./libs/mongoutils');

processResponses();

setInterval(processResponses, process.env.DELAY);

function processResponses() {
    mongoClient.processQuery(
        mongoUtil.getDataQuery.bind(null, process.env.BOT_ID, moment().subtract(1, 'hour').format(), moment().format()),
        ([data]) => notification(data || {})
    );
}

function notification({ count = 0, fallback = 0, percent = 0.0 }) {
    if (percent * 100 >= process.env.THRESHOLD) {
        const mailBody = format(
            process.env.MAIL_TEMPLATE,
            `${moment().subtract(1, 'day').subtract(1, 'hour').format('h:m')}-${moment().subtract(1, 'day').format('h:m')}`,
            process.env.BOT_ID,
            `${process.env.THRESHOLD}%`,
            percent * 100);

        const send = require('gmail-send')({
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
            to: process.env.MAIL_DESTINATION.split(/[ ,;]/).filter(s => s),
            subject: 'Reporte',
            html: mailBody,
        });

        send({}, (err, res) => console.log(`error: ${err}, response: ${res}`));
    } else {
        consolel.log(`percent: ${percent} time: ${moment().format()}`);
    }
}

