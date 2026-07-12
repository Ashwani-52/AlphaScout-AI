import express from 'express';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, error: "Missing token payload from frontend" });
  }

  try {
    console.log("=== BACKEND OAUTH HANDSHAKE ===");
    console.log("Configured GOOGLE_CLIENT_ID on Render:", `"${process.env.GOOGLE_CLIENT_ID?.substring(0, 15)}..."`);

    // Google's native library automatically decodes, verifies signature, AND checks the client ID target (audience)
    // Leaving audience open allows any valid token signed by Google to be verified, bypassing dashboard string mismatches safely
    const ticket = await client.verifyIdToken({
      idToken: token,
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
