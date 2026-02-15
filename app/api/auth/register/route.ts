import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, gender, age } = await request.json();

        // Validation
        if (!name || !email || !password || !gender || !age) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (gender !== 'boy' && gender !== 'girl') {
            return NextResponse.json(
                { error: 'Gender must be either "boy" or "girl"' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                gender,
                age: parseInt(age),
            },
            select: {
                id: true,
                name: true,
                email: true,
                gender: true,
                age: true,
            },
        });

        return NextResponse.json({
            user,
            message: 'User registered successfully',
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Registration error:', error);
        const message = error instanceof Error ? error.message : 'Failed to register user';
        // Check for common Prisma errors
        if (message.includes("Can't reach database") || message.includes('connect')) {
            return NextResponse.json(
                { error: 'Database connection failed. Please try again later.' },
                { status: 503 }
            );
        }
        if (message.includes('Unique constraint')) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to register user. Please try again.' },
            { status: 500 }
        );
    }
}
