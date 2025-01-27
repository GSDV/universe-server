import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';



export const API_VERSION = 'v1';



// TOKEN RESTRICTIONS
// Maximum attempts allowed for one activation token, before it is deleted and user must request another
export const MAX_ACTIVATE_TOKEN_ATTEMPTS = 5;
// ActivateTokens are expired if they were sent more than 5 hours ago
export const ACTIVATE_TOKEN_EXPIRATION = 60 * 5;
// RP Tokens are expired if they were sent more than 5 hours ago
export const RP_TOKEN_EXPIRATION = 60 * 5;



export const PROFILE_PER_SCROLL = 15;

export const POST_PER_SCROLL = 15;



// UTILS FOR PRISMA CALLS
export const OMIT_USER = {
    createdAt: true,
    updatedAt: true,
    email: true,
    password: true,
    salt: true,
    deleted: true,
    banned: true,
    banExpiration: true,
    banMsg: true
} satisfies Prisma.UserOmit;

export const INCLUDE_AUTHOR = {
    author: {
        include: { university: true },
        omit: OMIT_USER
    }
} satisfies Prisma.PostInclude;



export const getUserLike = (userId: string) => {
    return {
        where: { userId },
        select: { id: true },
        take: 1
    };
}



export const getUserFollow = (followerId: string) => {
    return {
        where: { followerId }
    };
}



export const COUNT_REPLIES = {
    _count: {
        select: {
            replies: true
        }
    }
}



// NextResponse used in API routes
export const response = (msg: string, cStatus: number, data?: Record<string, unknown>) => {
    if (cStatus/100 == 2) return NextResponse.json({ cStatus, msg, ...(data || {}) }, { status: 200 })
    return NextResponse.json({ cStatus, msg, ...(data || {}) }, { status: 400 })
}



export const ADMIN_AUTH_TOKEN_COOKIE_KEY = 'admin_auth_token';