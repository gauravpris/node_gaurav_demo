const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const sendEmail = require("../utils/mailer");
const sendSMS = require("../utils/sms");
const admin = require('firebase-admin');
//const serviceAccount = require('../musicapp-practice-firebase.json');


// Initialize Firebase Admin SDK with environment variables
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace \n for proper formatting
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

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
        const { emailOrPhone, password, deviceToken } = req.body; // Added deviceToken

        // Validation
        if (!emailOrPhone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email/contact number and password",
            });
        }

        // Find user
        const user = await User.findOne({
            $or: [{ email: emailOrPhone }, { contactNumber: emailOrPhone }],
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                contactNumber: user.contactNumber,
            },
            process.env.JWT_SECRET
        );

        // Update user with device token if provided
        if (deviceToken) {
            user.deviceToken = deviceToken;
            await user.save();
        }

        // Send welcome push notification if device token exists
        if (user.deviceToken) {
            const message = {
                notification: {
                    title: 'Welcome to Our App CHODU PRIT!',
                    body: `Hello ${user.fullName}, thanks for logging in!`,
                },
                token: user.deviceToken,
            };

            try {
                await admin.messaging().send(message);
                console.log('Welcome notification sent successfully to:', user.email);
            } catch (notificationError) {
                console.error('Error sending welcome notification:', notificationError);
                // Continue with login even if notification fails
            }
        } else {
            console.error('Not getting device token from user');
        }

        // Remove sensitive data before sending response
        user.password = undefined;

        // Send response with token
        res.status(200).json({
            success: true,
            message: "Login successful",
            deviceToken: user.deviceToken ?? "",
            token,
            user: {
                id: user._id,
                email: user.email,
                contactNumber: user.contactNumber,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
