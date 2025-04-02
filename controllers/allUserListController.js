const User = require('../models/Users');

exports.allUser = async (req, res) => {
    try {
        // Get logged-in user's ID from JWT
        const loggedInUserId = req.user.userId;

        // Fetch all users except the logged-in user
        const users = await User.find({ _id: { $ne: loggedInUserId } })
        .select("-password -__v -_id -isVerified"); // Exclude password, version, _id, and isVerified

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: "Server error fetching users"
        });
    }
};