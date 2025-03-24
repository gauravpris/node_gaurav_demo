const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const sendEmail = require("../utils/mailer");
const sendSMS = require("../utils/sms");
//

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.signup = async (req, res) => {
    try {
        const { fullName, email, contactNumber, password } = req.body;

        // Check if email or contact number already exists
        const existingUser = await User.findOne({ $or: [{ email }, { contactNumber }] });
        if (existingUser) {
            return res.status(200).json({ 
                success: false, 
                message: "Email or contact number already registered", 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ fullName, email, contactNumber, password: hashedPassword });

        await user.save(); // Auto-increment ID will be assigned here

        // Send confirmation messages
        await sendEmail(email, "Welcome!", "You have successfully signed up!");
        await sendSMS(contactNumber, "Welcome to our app!");

        res.status(201).json({ 
            success: true,
            message: "User registered successfully",
            user: {
                id: user.id, // 👈 Return auto-incremented ID
                fullName: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Login with email/password

exports.login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        if (!emailOrPhone) {
            return res.status(200).json({success: false, message: "Please enter email/contact number" });
        }else if (!password){
            return res.status(200).json({success: false, message: "Please enter password" });
        }


        // Check if the user exists
        const user = await User.findOne({ 
            $or: [{ email: emailOrPhone }, { contactNumber: emailOrPhone }] 
        });

        if (!user) {
            return res.status(200).json({ 
                success: false, 
                message: "User not found", 
            });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ 
                success: false, 
                message: "Invalid credentials", 
            });
        }

        // If credentials are correct, return success
        res.json({ 
            success: true, 
            message: "Login successful", 
            user: { id: user.id, email: user.email, contactNumber: user.contactNumber }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { emailOrPhone, otp } = req.body;
        const user = await User.findOne({ 
            $or: [{ email: emailOrPhone }, { contactNumber: emailOrPhone }] 
        });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.otp = null;
        user.otpExpiry = null;
        user.isVerified = true;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, message: "Login successful" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
