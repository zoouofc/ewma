/**
 * Database wrapper
 * @file db.js
 * @namespace db
 * @author Mitchell Sawatzky
 */

const mysql = require("mysql");
const constants = require(`${__rootname}/constants`);
const exitProcedures = require(`${__rootname}/exitProcedures`)
const config = require(`${__rootname}/conf.json`);

let dbRegistry = [];

// if manual is true, you are responsible for closing the connection
module.exports.acquire = function (callback, manual) {
    let id = dbRegistry.length;

    let connection = {
        _connection: mysql.createConnection({
            socketPath: config['database-socket'],
            user: config['database-user'],
            password: config['database-password'],
            database: "ewma"
        })
    };

    if (!manual) {
        connection.index = id;
    }

    connection.kill = function (clbk) {
        if (connection._connection.state !== "disconnected") {
            connection._connection.end(function (err) {
                if (err) {
                    console.error(`Could not close connection ${connection.index}`);
                    console.error(err.stack);
                }
                clbk();
            });
        } else {
            // already closed
            clbk();
        }
    };

    if (!manual) {
        dbRegistry.push(connection);
    }

    // wrap methods here for flexibility later and statistical gathering
    connection.queries = [];
    connection.do = function (query, esc, cb) {
        let start = Date.now();
        if (typeof esc === 'function') {
            cb = esc;
            esc = [];
        }
        connection._connection.query(query, esc, (err, rows) => {
            connection.queries.push({
                query: query,
                duration: Date.now() - start
            });
            cb(err, rows);
        });
    }

    connection.summary = function (request) {
        let max = {
            query: ';',
            duration: 0
        };
        let time = 0;
        for (query of connection.queries) {
            if (query.duration > max.duration) {
                max = query;
            }
            time += query.duration;
        }
        return `Database Queries: ${connection.queries.length}\n        Total Query Duration: ${time}ms\n        Longest Query: ${max.duration}ms` + (request.admin ? `        ${max.query}` : '');
    }

    connection._connection.connect(function (err) {
        if (err) {
            throw err;
        }

        if (connection._connection.state !== "authenticated") {
            throw new Error(`Bad connection state: ${connection._connection.state}`);
        }

        if (!manual) {
            // try to close the connection on shutdown
            exitProcedures.register(constants.priority.HIGH, connection.kill);
        }

        // we're going to run this on random connections even though that's pretty overkill
        // I just don't want to deal with a cron job at this point
        // It can process while the connection is handled
        if (!manual && Date.now() % 100 === 0) {
            connection.do('DELETE FROM session WHERE issued < ?', [Math.floor(Date.now() / 1000) - config['session-length']], (err) => {
                if (err) {
                    throw err;
                }
            });
        }

        callback(connection);
        return;
    });
};
