/**
 * User model
 * @author Mitchell Sawatzky
 */

const bcrypt = require('bcrypt');

class User {
    constructor (db) {
        this.db = db;
        this.permissions = null;
        this.valid = false;
        this.authenticated = false;
        this.attributes = {};
    }

    initFromId (id, clbk) {
        this.db.do('SELECT * FROM users WHERE id = ?;', [id], (err, rows) => {
            if (err) {
                clbk(err);
                return;
            }

            if (rows.length) {
                // user exists
                for (let prop in rows[0]) {
                    this.attributes[prop] = rows[0][prop];
                }
                this.valid = true;
            }
            clbk(null);
        });
    }

    initFromUsername (username, clbk) {
        this.db.do('SELECT id FROM users WHERE username = ?;', [username], (err, rows) => {
            if (err) {
                clbk(err);
                return;
            }

            if (rows.length) {
                // user exists
                this.initFromId(rows[0].id, (err) => {
                    if (err) {
                        clbk(err);
                        return;
                    }

                    clbk(null);
                });
            } else {
                clbk(null);
            }
        });
    }

    get [Symbol.toStringTag] () {
        return `models.user.User(${this.attributes.username})`;
    }

    authenticate (password, clbk) {
        if (!this.valid) {
            clbk(new Error('User has not been initialized'));
            return;
        }

        bcrypt.compare(password, this.attributes.password, (err, res) => {
            if (err) {
                clbk(err);
                return;
            }

            if (res) {
                this.authenticated = true;
                clbk(null, true);
            } else {
                this.authenticated = false;
                clbk(null, false);
            }
        });
    }

    getPerms (clbk) {
        this.db.do('SELECT perm FROM permissions WHERE user = ?', [this.attributes.id], (err, rows) => {
            if (err) {
                clbk(err);
                return;
            }

            this.permissions = new Set();
            for (let row of rows) {
                this.permissions.add(row.perm);
            }
            clbk();
        });
    }

    checkPerm (permission, clbk) {
        if (!this.valid || !this.authenticated) {
            // no user - no permissions
            clbk(null, false);
        } else if (!this.permissions) {
            this.getPerms((err) => {
                if (err) {
                    clbk(err);
                    return;
                }

                clbk(null, this.permissions.has(permission));
            });
        } else {
            clbk(null, this.permissions.has(permission));
        }
    }
}

module.exports = {
    User: User
};
