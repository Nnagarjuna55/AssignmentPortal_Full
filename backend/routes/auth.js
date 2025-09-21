const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({msg:'Email and password required'});
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({msg:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({msg:'Invalid credentials'});
    const payload = { id: user._id, role: user.role, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '8h' });
    res.json({ token, role: user.role, name: user.name });
  }catch(err){
    console.error(err);
    res.status(500).json({msg:'Server error'});
  }
});

module.exports = router;
