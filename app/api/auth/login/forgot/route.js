import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import NodeCache from 'node-cache';
import argon2 from 'argon2';
import crypto from 'node:crypto';
import connectDB from '@/lib/connectDB';
import User from '@/schemas/User';

const codeCache = new NodeCache({ stdTTL: 60 });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: 'Email not found' }, { status: 404 });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        codeCache.set(email, resetCode);

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"CodeVault" <noreply@codevault.com>',
            to: email,
            subject: 'Password Reset Code',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password for CodeVault.</p>
          <p>Here is your 6-digit verification code:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p>This code will expire in 1 minute.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: 'Reset code sent to email'
        });

    } catch (error) {
        console.error('Error sending reset code:', error);
        return NextResponse.json(
            { error: 'Failed to send reset code' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code are required' },
                { status: 400 }
            );
        }

        const storedCode = codeCache.get(email);

        if (!storedCode) {
            return NextResponse.json(
                { error: 'Code expired or not found' },
                { status: 400 }
            );
        }

        if (storedCode === code) {
            codeCache.del(email);

            return NextResponse.json({
                success: true,
                message: 'Code verified successfully'
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid code' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error verifying code:', error);
        return NextResponse.json(
            { error: 'Failed to verify code' },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const salt = crypto.randomBytes(32);

        const hashedPassword = await argon2.hash(password, {
            salt,
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });

        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    }
}