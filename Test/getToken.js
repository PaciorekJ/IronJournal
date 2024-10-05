import axios from "axios";
import { config } from "dotenv";
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };
config();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Replace with the email and password of a valid user in your Firebase Authentication
const email = process.env.FIREBASE_EMAIL;
const password = process.env.FIREBASE_PASSWORD;

async function main() {
    try {
        const apiKey = process.env.FIREBASE_API_KEY;
        const signInResponse = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
                email,
                password,
                returnSecureToken: true,
            },
        );

        const idToken = signInResponse.data.idToken;
        console.log("Successfully signed in.");

        console.log(`Token: ${idToken}`);
        
    } catch (error) {
        console.error(
            "Error signing in:",
            error.response
                ? JSON.stringify(error.response)
                : JSON.stringify(error.message),
        );
    }
}

main();
