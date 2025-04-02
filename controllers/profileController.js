const User = require("../models/Users"); // Import User model
const mongoose = require("mongoose");

exports.getProfile = async (req, res) => {
    try {
        // Use JWT user ID if no userId is passed in the request
        const userId = req.query.userId || req.user?.userId;

        console.log("Fetching profile for userId:", userId); // Debug log

        // Ensure userId is a valid number
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format",
            });
        }

        // Find user by `id`
        const user = await User.findOne({ id: userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber,
            }
        });

    } catch (error) {
        console.error("Profile retrieval error:", error);

        res.status(500).json({
            success: false,
            message: "Server error retrieving profile",
            error: error.message
        });
    }
};
