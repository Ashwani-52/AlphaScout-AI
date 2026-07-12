import express from 'express';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, error: "Missing token payload from frontend" });
  }

  try {
    console.log("=== BACKEND OAUTH HANDSHAKE ===");
    console.log("Configured GOOGLE_CLIENT_ID on Render (raw):", `"${process.env.GOOGLE_CLIENT_ID}"`);
    console.log("Configured GOOGLE_CLIENT_ID on Render (trimmed):", `"${GOOGLE_CLIENT_ID}"`);

    // Parse the token payload natively to inspect the audience (aud) and issuer (iss)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadDecoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        console.log("Token payload audience (aud):", `"${payloadDecoded.aud}"`);
        console.log("Token payload issuer (iss):", `"${payloadDecoded.iss}"`);
        console.log("Token payload email:", `"${payloadDecoded.email}"`);
      }
    } catch (e) {
      console.warn("Failed to parse token payload for debugging:", e.message);
    }

    // Google's native library automatically decodes, verifies signature, AND checks the client ID target (audience)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID || undefined,
    });
    
    const payload = ticket.getPayload();
    console.log("Successfully verified Google Profile payload for:", payload.email);

    // Dynamic Database Storage: Automatically creates the database and collections if they don't exist
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
    console.error("Google Handshake Verification Failed Crudely:", error.message);
    res.status(401).json({ success: false, error: error.message });
  }
});

export default router;
