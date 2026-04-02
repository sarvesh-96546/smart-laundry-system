const { betterAuth } = require("better-auth");
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.TRANSACTION_URL,
    ssl: { rejectUnauthorized: false }
});

const auth = betterAuth({
    database: pool,
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:5002",
        "http://localhost:3000",
        "https://pristine-flow.vercel.app",
        "https://pristinr-flow-api.onrender.com"
    ],
    advanced: {
        cookie: {
            sameSite: "none",
            secure: true
        },
        account: {
            skipStateCookieCheck: true
        }
    },
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "customer"
            },
            phone_number: {
                type: "string",
                required: false
            }
        }
    }
});

module.exports = { auth, pool };
