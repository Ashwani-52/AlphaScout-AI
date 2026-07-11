import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/sync', async (req, res) => {
  const { name, email, photoURL } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required for syncing.' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        photoURL
      });
      console.log(`[Auth] Saved new user to MongoDB Atlas: ${email}`);
    } else {
      // Update avatar or name if they changed
      user.name = name;
      user.photoURL = photoURL;
      await user.save();
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('[Auth] Error syncing user:', error);
    res.status(500).json({ error: 'Internal server error during user sync.' });
  }
});

export default router;
