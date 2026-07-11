import express from 'express';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Google credential token is required.' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, name, email, picture } = payload;

    // Perform an atomic upsert operation to avoid duplicates
    let user = await User.findOneAndUpdate(
      { email: email },
      { 
        $set: { 
          googleId: sub, 
          name: name, 
          avatar: picture 
        } 
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('[Auth] Google OAuth validation error:', error.message);
    res.status(401).json({ success: false, error: 'Invalid token validation handshake' });
  }
});

export default router;
