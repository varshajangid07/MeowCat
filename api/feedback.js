import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
    });
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { email, feedback } = req.body;
            if (!email || !feedback) {
                return res.status(400).json({ error: "Email and feedback are required" });
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