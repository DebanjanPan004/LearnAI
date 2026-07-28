import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { validationResult } from "express-validator";
import { User } from "../models/User.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service.js";

function signToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET ?? "dev-secret", {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as any
  });
}

export async function register(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    verificationToken: otp,
    verificationTokenExpires: otpExpires,
    emailVerified: false
  });

  sendVerificationEmail(user.email, otp).catch(console.error);

  res.status(201).json({
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, emailVerified: false }
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified }
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: "If that email exists, we have sent a reset link." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  sendPasswordResetEmail(user.email, resetToken).catch(console.error);

  res.json({ message: "If that email exists, we have sent a reset link." });
}

export async function resetPassword(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  user.password = await bcrypt.hash(password, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: "Password reset complete. You can now login." });
}

export async function verifyEmail(req: Request, res: Response) {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ message: "Email and verification code are required" });
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired verification code" });
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({
    message: "Email successfully verified",
    user: { id: user.id, name: user.name, email: user.email, emailVerified: true }
  });
}

