const express=require("express");
const router=express.Router();
const bcrypt=require("bcrypt");
const User=require("../models/UserSchema");
const jwt=require("jsonwebtoken");
const { protect }= require("../middleware/userAuth")
const rateLimit = require("express-rate-limit"); // rate limit for otp 


const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// rate limiter
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, //max 5 attempts per IP per 15 minutes
    message: { message: "Too many requests, please try again later." }
});

//generate JWT token
const generateToken=(id)=>{
    return jwt.sign(({userId:id}),process.env.JWT_SECRET, {expiresIn: "7d"})
}

router.post('/register', async (req,res)=>{
    const { firstName, lastName, username, email, password } = req.body;
    if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const existingUsername = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({ message: "email already exists" });
    }
    if (existingUsername) {
        return res.status(400).json({ message: "display name already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        league: [],
        team: [],
    });
    try {
        await newUser.save();  //save user 
        const token=generateToken(newUser._id);
        res.status(201).json({ message: "User registered successfully", token, 
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, try again later." });
    }
});

//user login
router.post('/login', async (req,res)=>{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token=generateToken(user._id);
    res.status(200).json({
        success: true,
        token,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            league: user.league,
            team: user.team,
        }
    });

});

router.post('/logout', (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

router.get("/me", protect,async(req,res)=>{
    res.status(200).json(req.user);
});

// Password retrieval 
router.post("/forgot-password", otpLimiter, async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(200).json({ message: "If the email address is valid you will receive a One Time Password via email." });
      }
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
      const otpExpiry = Date.now() + 1000 * 60 * 5; 
  
      user.resetToken = otp;
      user.resetTokenExpiry = otpExpiry;
      await user.save();
  
      await resend.emails.send({
        from: "Fantasy Draft Kit <onboarding@resend.dev>",
        to: user.email,
        subject: "Fantasy Draft Kit - One Time Password",
        html: `
          <h2>Password Reset OTP</h2>
          <p>Your One Time Password is:</p>
          <h1 style="font-size: 32px;">${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
          <p>If you did not request this, ignore this email.</p>
        `
      });
  
      res.status(200).json({ message: "If the email address is valid you will receive a One Time Password via email." });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    try {
      const user = await User.findOne({
        email,
        resetToken: otp,
        resetTokenExpiry: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      res.status(200).json({ message: "OTP verified" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.post("/reset-password", async (req, res) => {
    const { email, otp, password } = req.body;
    try {
      const user = await User.findOne({
        email,
        resetToken: otp,
        resetTokenExpiry: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      user.password = await bcrypt.hash(password, 10);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports=router;