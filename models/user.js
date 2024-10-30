/** User class for message.ly */

const { DB_URI } = require("../config");
const db = require("../db");



/** User of the site. */

class User {

    /** register new user -- returns
     *    {username, password, first_name, last_name, phone}
     */
  
    static async register({username, password, first_name, last_name, phone, join_at = new Date(), last_login_at = new Date()}) {
        const result = await db.query(
            `INSERT INTO users
            (username, password, first_name, last_name, phone, join_at, last_login_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, password, first_name, last_name, phone, join_at, last_login_at`, 
            [username, password, first_name, last_name, phone, join_at, last_login_at]
        );
        return result.rows[0];
    }
  
    /** Authenticate: is this username/password valid? Returns boolean. */
  
    static async authenticate(username, password) {
        const result = await db.query(
            `SELECT password 
            FROM users
            WHERE username = $1`,
            [username]
        );
        const user = result.rows[0];
        return user && user.password === password;
     }
  
    /** Update last_login_at for user */
  
    static async updateLoginTimestamp(username) {
        const result = await db.query(
            `UPDATE users
            SET last_login_at = NOW()
            WHERE username = $1
            RETURNING username, last_login_at`,
            [username]
        );
        return result.rows[0];
     }
  
    /** All: basic info on all users:
     * [{username, first_name, last_name, phone}, ...] */
  
    static async all() {
        const result = await db.query(
            `SELECT username, first_name, last_name, phone
            FROM users 
            ORDER BY username`
        );
        return result.rows;
     }
  
    /** Get: get user by username
     *
     * returns {username,
     *          first_name,
     *          last_name,
     *          phone,
     *          join_at,
     *          last_login_at } */
  
    static async get(username) {
        const result = await db.query(
            `SELECT username, first_name, last_name, phone, join_at, last_login_at
            FROM users 
            WHERE username = $1`,
            [username]
        );
        return result.rows[0];
     }
  
    /** Return messages from this user.
     *
     * [{id, to_user, body, sent_at, read_at}]
     *
     * where to_user is
     *   {username, first_name, last_name, phone}
     */
  
    static async messagesFrom(username) {
        const result = await db.query(
            `SELECT m.id, m.body, m.sent_at, m.read_at, t.username AS to_user_username, t.first_name AS to_user_first_name,
            t.last_name AS to_user_last_name, t.phone AS to_user_phone
            FROM messages AS m
            JOIN users AS t ON m.to_username = t.username
            WHERE m.from_username = $1`,
            [username]
        );
        return result.rows.map(m => ({
            id : m.id,
            body : m.body,
            sent_at : m.sent_at,
            read_at : m.read_at,
            to_user : {
                username : m.to_user_username,
                first_name : m.to_user_first_name,
                last_name : m.to_user_last_name,
                phone : m.to_user_phone
            }
        }));
     }
  
    /** Return messages to this user.
     *
     * [{id, from_user, body, sent_at, read_at}]
     *
     * where from_user is
     *   {username, first_name, last_name, phone}
     */
  
    static async messagesTo(username) {
        const result = await db.query(
            `SELECT m.id,
                    m.body,
                    m.sent_at,
                    m.read_at,
                    f.username AS from_user_username,
                    f.first_name AS from_user_first_name,
                    f.last_name AS from_user_last_name,
                    f.phone AS from_user_phone
             FROM messages AS m
             JOIN users AS f ON m.from_username = f.username
             WHERE m.to_username = $1`,
            [username]
        );
        
        return result.rows.map(m => ({
            id: m.id,
            body: m.body,
            sent_at: m.sent_at,
            read_at: m.read_at,
            from_user: {
                username: m.from_user_username,
                first_name: m.from_user_first_name,
                last_name: m.from_user_last_name,
                phone: m.from_user_phone
            }
        }));
    }

  }
  
  
  module.exports = User;