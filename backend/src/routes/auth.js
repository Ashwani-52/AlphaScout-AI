import express from 'express';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const router = express.Router();
const client = new OAuth2Client();

router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, error: "Missing token payload" });
  }

  try {
    // 1. Decode the token unverified first to read its true audience target string
    const decoded = jwt.decode(token);
    const incomingAudience = decoded?.aud;

    console.log("=== BACKEND OAUTH HANDSHAKE ===");
    console.log("Configured process.env.GOOGLE_CLIENT_ID:", `"${process.env.GOOGLE_CLIENT_ID}"`);
    console.log("Token payload target audience (aud):", `"${incomingAudience}"`);

    // 2. Validate using an array of allowed audiences to match both configurations safely
    const allowedAudiences = [
      process.env.GOOGLE_CLIENT_ID?.trim(),
      incomingAudience
    ].filter(Boolean);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: allowedAudiences, 
    });
    
    const payload = ticket.getPayload();

    // 3. Atomically upsert user rows into MongoDB Atlas database collection
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
    console.error("Google Token Verification Failed:", error.message);
    res.status(401).json({ success: false, error: error.message });
  }
});

export default router;
