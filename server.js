require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes")
const allUserListRoute = require("./routes/allUserListRoute")

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/get_profile", profileRoutes)
app.use("/api/all_users",allUserListRoute)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
