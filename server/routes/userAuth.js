const express=require("express");
const router=express.Router();
const bcrypt=require("bcrypt");
const User=require("../models/UserSchema");
const jwt=require("jsonwebtoken");
const { protect }= require("../middleware/userAuth")


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
        league: null,
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
        }
    });

});

router.post('/logout', (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

router.get("/me", protect,async(req,res)=>{
    res.status(200).json(req.user);
});


module.exports=router;