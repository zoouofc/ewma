/**
 * Take over the process and spit out an error message
 * @file crashDump.js
 * @namespace crashDump
 * @author Mitchell Sawatzky
 */

module.exports.dump = function (stack) {
    let mailBody = `EWMA had a Sad.
----------
REQUEST_ID: ${process.env.REQUEST_ID ? process.env.REQUEST_ID : 'unknown'}
REQUEST_URI: ${process.env.REQUEST_URI ? process.env.REQUEST_URI : 'unknown'}
REQUEST_METHOD: ${process.env.REQUEST_METHOD ? process.env.REQUEST_METHOD : 'unknown'}
Stack Trace:
${stack}
    `;
    process.stdout.write(`status: 500 Internal Server Error
content-type: text/html

<!DOCTYPE html>
<html>
    <head>
        <title> EWMA had a Sad </title>
        <style>
        </style>
    </head>
    <body>
        <div id="site">
            <h1>EWMA had a sad :(</h1>
            <h3>EWMA has encountered an error. This has been logged, but feel free to send an email to
                <a href="mailto:webmaster@zooengg.ca?subject=EWMA%20Crash&body=${encodeURIComponent(mailBody)}">webmaster@zooengg.ca</a>.</h3>
            <pre id="stacktrace">
${stack}
            </pre>
        </div>
    </body>
</html>`);
}
