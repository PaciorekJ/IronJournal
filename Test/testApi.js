import axios from "axios";
import { config } from "dotenv";
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };
config();

console.log("Testing API...");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Replace with the email and password of a valid user in your Firebase Authentication
const email = process.env.FIREBASE_EMAIL;
const password = process.env.FIREBASE_PASSWORD;

// Define your API endpoints to test
const endpoints = [];

endpoints.map((endpoint) => {
    endpoint.url = `${process.env.BASE_URL}${endpoint.url}`;
});

async function main() {
    try {
        // Sign in to Firebase using the REST API
        const apiKey = process.env.FIREBASE_API_KEY; // Replace with your actual API key
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

        // Create an Axios instance with the Authorization header
        const axiosInstance = axios.create({
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });

        console.log(`${idToken}`);

        // Loop through the endpoints and make requests
        for (const endpoint of endpoints) {
            try {
                console.log(`\nTesting endpoint: ${endpoint.name}`);
                let response;

                switch (endpoint.method) {
                    case "GET":
                        response = await axiosInstance.get(endpoint.url, {
                            headers: endpoint.headers,
                        });
                        break;
                    case "POST":
                        response = await axiosInstance.post(
                            endpoint.url,
                            endpoint.body,
                            { headers: endpoint.headers },
                        );
                        break;
                    case "PATCH":
                        response = await axiosInstance.patch(
                            endpoint.url,
                            endpoint.body,
                            { headers: endpoint.headers },
                        );
                        break;
                    case "DELETE":
                        response = await axiosInstance.delete(endpoint.url, {
                            headers: endpoint.headers,
                        });
                        break;
                    default:
                        console.log(`Unsupported method: ${endpoint.method}`);
                        continue;
                }
            } catch (error) {
                console.error(
                    `Error testing endpoint ${endpoint.name}:`,
                    error.message,
                );
            }
        }
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
