import User from "../models/User.js";

export async function getByEmail(email) {
  return User.findOne({ email }).lean();
}

export async function getByEmailWithPassword(email) {
  return User.findOne({ email })
    .select("+password")
    .lean();
}

export async function create(userData) {
  const user = await User.create(userData);

  return user.toObject();
}