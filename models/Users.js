const mongoose = require("mongoose");
const Counter = require("./counters");

const UserSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    fullName: String,
    email: { type: String, unique: true },
    contactNumber: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false }
});

// Middleware to auto-increment the `id` field
UserSchema.pre("save", async function (next) {
    if (!this.id) { // Only set `id` if it's not already assigned
        const counter = await Counter.findByIdAndUpdate(
            { _id: "userId" },
            { $inc: { seq: 1 } }, // Increment sequence
            { new: true, upsert: true }
        );
        this.id = counter.seq; // Assign new auto-incremented ID
    }
    next();
});

module.exports = mongoose.model("User", UserSchema);