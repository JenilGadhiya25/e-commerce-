import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  lastLogin: Date,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const users = await User.find().sort({ lastLogin: -1 });
    res.status(200).json(users);
  }

  if (req.method === "POST") {
    const user = await User.create(req.body);
    res.status(201).json(user);
  }
}