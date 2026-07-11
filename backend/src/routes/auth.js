import express from 'express';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : undefined);

router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, error: 'Google credential token is required.' });
  }

  // TEMPORARY DEBUG: Print the exact environment variable being used by Render
  console.log("Backend GOOGLE_CLIENT_ID in use:", `"${process.env.GOOGLE_CLIENT_ID}"`);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      // Force verification against the strict env variable
      audience: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : undefined, 
    });
    
    const payload = ticket.getPayload();
    console.log("Token successfully verified for audience:", payload.aud);

    // Atomic upsert to MongoDB Atlas
    let user = await User.findOneAndUpdate(
      { email: payload.email },
      { 
        $set: { 
          googleId: payload.sub, 
          name: payload.name, 
          avatar: payload.picture 
        } 
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Handshake Failed Details:", error.message);
    res.status(401).json({ 
      success: false, 
      error: error.message,
      tip: "Check if this matches what Vercel VITE_GOOGLE_CLIENT_ID is sending."
    });
  }
});

export default router;
