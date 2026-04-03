const { betterAuth } = require("better-auth");
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";
const connectionString = isProduction ? process.env.DATABASE_URL : process.env.DIRECT_URL;

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 10000, 
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('Telemetric Failure: Database connection lost. Automatic recovery protocol engaged.', err);
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
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        }
    },
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectURI: process.env.BETTER_AUTH_URL + "/callback/google"
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
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    const { sendWelcomeEmail } = require("./utils/emailService");
                    try {
                        await sendWelcomeEmail(user.email, user.name);
                    } catch (error) {
                    }
                },
            },
        },
    },
});

module.exports = { auth, pool };
