/**
 * Mail utilities
 * @author Mitchell Sawatzky
 */

const fs = require('fs');
const child_process = require('child_process');

const conf = require(`${__rootname}/conf.json`);

function sendMail (headers, body, cb) {
    headers = headers || {};
    let outbox = [
        `From: "ENGG Week Movie Archive" <${conf['msmtp-from']}>`,
        'Content-Type: text/html'
    ];

    for (let header in headers) {
        outbox.push(`${header}: ${headers[header]}`);
    }

    outbox.push('', '');

    fs.writeFile('/tmp/ewma-mailout.mail', outbox.join('\n') + body, (err) => {
        if (err) {
            cb(err);
            return;
        }

        if (!/^[a-z]+$/.test(conf['msmtp-account'])) {
            throw new Error('Unsafe msmtp-account');
        }

        child_process.exec(`cat /tmp/ewma-mailout.mail | msmtp -C '${conf['build-destination']}/cgi/msmtprc' -X '${conf['build-destination']}/${conf['msmtp-log']}' -a '${conf['msmtp-account']}' -t`, (err, stdout, stderr) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null);
        })
    });
}

module.exports = {
    sendMail: sendMail
};
