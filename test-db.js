import dbConnect from './src/lib/db.js';
import User from './src/models/User.js';
import mongoose from 'mongoose';

async function test() {
  try {
    await dbConnect();
    console.log("Connected to DB.");
    const user = await User.create({
      name: "testrun",
      email: "testrun@test.com",
      password: "password123",
      role: "STUDENT"
    });
    console.log("User created", user);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    mongoose.disconnect();
  }
}
test();
