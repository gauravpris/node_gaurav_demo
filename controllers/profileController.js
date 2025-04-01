const User = require('../models/Users');

exports.getProfile = async (req, res) => {
    try {
        // Use JWT user ID if no userId is passed in the request
        const userId = req.body.userId || req.user.userId;

        // Find user by ID
        const user = await User.findById(userId);

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
