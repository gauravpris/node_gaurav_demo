const User = require('../models/Users');

exports.getProfile = async (req, res) => {
    try {
        // Get user ID from verified JWT
        const userId = req.user.userId;

        // Find user without sensitive fields
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber,
                // Add other public fields
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: "Server error retrieving profile"
        });
    }
};