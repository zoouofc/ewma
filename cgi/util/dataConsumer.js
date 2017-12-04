/**
 * Processor for data supplied via stdin (IE: POST)
 * @file dataConsumer.js
 * @namespace util.dataConsumer
 * @author Mitchell Sawatzky
 */

module.exports.consume = function (cb) {
    process.stdin.resume();
    process.stdin.setEncoding("utf-8");

    let data = "";
    process.stdin.on("data", function (chunk) {
        if (data > 1e6) {
            data = "";
            process.stdout.write(`status: 413 Payload Too Large
content-type: text/plain

`);
            process.exit(0);
        }
        data += chunk;
    });

    process.stdin.on("end", function () {
        cb(null, data);
    });
};
