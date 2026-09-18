import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const createModule = require('../lib/validator.js');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
    });
}

let wasmModule = null;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { email, feedback } = req.body;
            if (!email || !feedback) {
                return res.status(400).json({ error: "Email and feedback are required" });
            }
            if (!wasmModule) {
                wasmModule = await createModule();
            }
            const isValidEmail = wasmModule.ccall(
                'is_valid_email', 'boolean', ['string'], [email]
            );
            if (!isValidEmail) {
                return res.status(400).json({ error: "Invalid email format." });
            }

            const isValidFeedback = wasmModule.ccall(
                'is_valid_feedback', 'boolean', ['string'], [feedback]
            );
            if (!isValidFeedback) {
                return res.status(400).json({ error: "Feedback cannot be empty or contain links/spam." });
            }
            
            await admin.firestore().collection('feedbacks').add({ 
                email: email, 
                feedback: feedback,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            return res.status(200).json({ message: "Success" });

        } catch (error) {
            console.error("Firebase Error:", error);
            return res.status(500).json({ error: "Something went wrong" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}