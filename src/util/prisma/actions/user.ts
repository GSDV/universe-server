'use server';

import { prisma } from '@util/prisma/client';

import { cookies } from 'next/headers';

import { Prisma } from '@prisma/client';

import { AUTH_TOKEN_COOKIE_KEY } from '@util/global';
import { OMIT_USER, response } from '@util/global-server';

import { isValidUser, makePasswordHash, redactUserPrisma } from '@util/api/user';



export const createUser = async (displayName: string, username: string, email: string, password: string) => {
    const { hashedPassword, salt } = await makePasswordHash(password);

    const domain = email.split('@')[1];

    const userPrisma = await prisma.$transaction(async (tx) => {
        const uniPrisma = await tx.university.findUnique({
            where: { domain }
        });

        const newUser = await tx.user.create({
            data: {
                username,
                displayName,
                email,
                password: hashedPassword,
                salt,
                universityId: uniPrisma?.id
            },
            omit: OMIT_USER,
            include: { university: true }
        });
        
        return newUser;
    });

    return userPrisma;
}



export const updateUser = async (where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput ) => {
    const userPrisma = await prisma.user.update({
        where,
        data,
        include: { university: true }
    });
    return userPrisma;
}



export const getUser = async (where: Prisma.UserWhereInput) => {
    const userPrisma = await prisma.user.findFirst({ where });
    return userPrisma;
}



export const getUserWithUni = async (where: Prisma.UserWhereInput) => {
    const userPrisma = await prisma.user.findFirst({ where, include: { university: true } });
    return userPrisma;
}



export const getUserFromAuth = async (authtoken: string) => {
    const authTokenPrisma = await prisma.authToken.findFirst({
        where: { token: authtoken },
        include: { user: true }
    });
    // Return null if auth token is expired
    if (!authTokenPrisma) return null;
    return authTokenPrisma.user;
}



// Get logged in user, redacted.
export const getValidatedUser = async () => {
    const cookieStore = await cookies();
    const authTokenCookie = cookieStore.get(AUTH_TOKEN_COOKIE_KEY);
    if (!authTokenCookie || authTokenCookie.value === '') return { userPrisma: null, validUserResp: response(`You are not logged in.`, 103) };

    const authToken = authTokenCookie.value;
    const userPrisma = await getUserFromAuth(authToken);

    const resValidUser = isValidUser(userPrisma);
    if (!resValidUser.valid) return { userPrisma: null, validUserResp: resValidUser.res };
    if (!userPrisma) return { userPrisma: null, validUserResp: response(`Server error.`, 900) }; // For TypeScript.

    return { userPrisma: redactUserPrisma(userPrisma) };
}



export const getUserWithUniFromAuth = async (authtoken: string) => {
    const authTokenPrisma = await prisma.authToken.findFirst({
        where: { token: authtoken },
        include: { user: {
            include: { university: true }
        } }
    });
    // Return null if auth token is expired
    if (!authTokenPrisma) return null;
    return authTokenPrisma.user;
}



// Get logged in user, redacted, with university.
export const getValidatedUserWithUni = async () => {
    const cookieStore = await cookies();
    const authTokenCookie = cookieStore.get(AUTH_TOKEN_COOKIE_KEY);
    if (!authTokenCookie || authTokenCookie.value === '') return { userPrisma: null, validUserResp: response(`You are not logged in.`, 103) };

    const authToken = authTokenCookie.value;
    const userPrisma = await getUserWithUniFromAuth(authToken);

    const resValidUser = isValidUser(userPrisma);
    if (!resValidUser.valid) return { userPrisma: null, validUserResp: resValidUser.res };
    if (!userPrisma) return { userPrisma: null, validUserResp: response(`Server error.`, 900) }; // For TypeScript.

    return { userPrisma: redactUserPrisma(userPrisma) };
}