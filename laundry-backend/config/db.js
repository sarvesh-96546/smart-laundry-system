const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../laundry.db');
const db = new sqlite3.Database(dbPath);

// Unified Wrapper to use Promises with SQLite
const dbPromise = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve([rows]);
                });
            } else {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve([{ insertId: this.lastID, changes: this.changes }]);
                });
            }
        });
    },
    // Aliases for compatibility with mysql2-style code
    execute: function(sql, params) { return this.query(sql, params); }
};

module.exports = dbPromise;
