import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Creation from '@/schemas/Creations';
import User from '@/schemas/User';
import { checkRateLimit } from '../../../lib/rateLimit';
import { performSecurityCheck } from '@/lib/securityUtils';

export async function POST(request) {
  try {
    const headersList = await headers();
    const ip = await headersList.get('x-forwarded-for') || 'unknown';
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let userId = null;

    const { 
      title, 
      description, 
      code,
      language = 'plaintext',
      metadata,
      privacy = 'public',
      tags = [],
      overrideSecurityCheck = false
    } = await request.json();
    
    if (!title || !description || !code) {
      return NextResponse.json(
        { message: 'Title, description, and code are required' },
        { status: 400 }
      );
    }

    if (tags.length > 5) {
      return NextResponse.json(
        { message: 'Maximum 5 tags allowed' },
        { status: 400 }
      );
    }

    const securityResults = performSecurityCheck({ title, description, code, language });
    
    if (!securityResults.isSecure) {
      if (securityResults.hasProfanity) {
        return NextResponse.json(
          { 
            message: 'Content contains inappropriate language',
            details: securityResults.profanityDetails
          },
          { status: 400 }
        );
      }
      
      if (!securityResults.malwareDetails.isSafe) {
        if (securityResults.malwareDetails.riskLevel === 'high' || !securityResults.allowOverride || !overrideSecurityCheck) {
          return NextResponse.json(
            { 
              message: `Code contains potentially malicious patterns (Risk: ${securityResults.malwareDetails.riskLevel})`,
              details: {
                riskScore: securityResults.malwareDetails.riskScore,
                riskLevel: securityResults.malwareDetails.riskLevel,
                patterns: securityResults.malwareDetails.matches,
                risks: securityResults.malwareDetails.risks,
                allowOverride: securityResults.allowOverride
              }
            },
            { status: 400 }
          );
        }
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    const rateLimitKey = userId ? `user_${userId}` : `ip_${ip}`;
    const rateLimitResult = checkRateLimit(rateLimitKey, !!userId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { message: 'You\'re creating snippets too quickly. Please wait a minute.' },
        { status: 429 }
      );
    }

    await connectDB();
    
    const creationData = {
      title,
      description,
      code,
      owner: null,
      author: null,
      language: language.toLowerCase(),
      tags: tags.map(tag => tag.trim()),
      metadata: {
        lines: metadata?.lines || code.split('\n').length,
        characters: metadata?.characters || code.length,
        lastModified: new Date()
      },
      privacy: privacy 
    };
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;

        const user = await User.findById(userId);
        if (user) {
          creationData.owner = user.id;
          creationData.author = user.name || user.username || 'Anonymous';
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }
    
    const creation = await Creation.create(creationData);
    
    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        { $push: { creations: creation._id } },
        { new: true }
      );
    }
    
    return NextResponse.json({ 
      message: 'Creation saved successfully',
      id: creation._id,
      creation,
      remaining: rateLimitResult.remaining
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error saving creation:', error);
    return NextResponse.json(
      { message: 'Error saving creation' },
      { status: 500 }
    );
  }
}
