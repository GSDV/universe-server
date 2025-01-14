'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@util/prisma/client';

import { cookies } from 'next/headers';

import { v4 as uuidv4 } from 'uuid';

import { ADMIN_AUTH_TOKEN_COOKIE_KEY } from '@util/global-server';



export const createAdminAuthToken = async (adminId: string) => {
    const token = uuidv4();
    await prisma.adminAuthToken.create({
        data: {
            token: token,
            admin: { connect: { id: adminId } }
        }
    });
    return token;
}

export const deleteAdminAuthToken = async (authToken: string) => {
    await prisma.adminAuthToken.delete({
        where: { token: authToken }
    });
}



export const getAdmin = async (where: Prisma.AdminWhereUniqueInput) => {
    const adminPrisma = await prisma.admin.findFirst({ where });
    return adminPrisma;
}



export const getValidatedAdmin = async () => {
    const cookieStore = await cookies();
    const authTokenCookie = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE_KEY);
    if (!authTokenCookie || authTokenCookie.value === '') return null;

    const authToken = authTokenCookie.value;
    const adminPrisma = await getAdminFromAuth(authToken);
    if (!adminPrisma) return null;

    return adminPrisma;
}


// Sliding window of 1 second
const WINDOW_LENGTH = 1000;
const MAX_REQ_PER_WINDOW = 2;
const getAdminFromAuth = async (authtoken: string) => {
    const adminPrisma = await prisma.$transaction(async (tx) => {
        const now = new Date();
        const windowStart = new Date(Date.now() - WINDOW_LENGTH);

        const adminAuthTokenPrisma = await tx.adminAuthToken.findUnique({
            where: { token: authtoken },
            include: { admin: true }
        });

        if (!adminAuthTokenPrisma) return null;

        const validReqTimestamps = adminAuthTokenPrisma.reqTimestamps
            .map(timeStr => new Date(timeStr))
            .filter(time => time >= windowStart)
            .sort((a, b) => a.getTime() - b.getTime());

        // Check if rate limit exceeded.
        // If so, return null. Do not add this as a request.
        if (validReqTimestamps.length >= MAX_REQ_PER_WINDOW) return null;

        validReqTimestamps.push(now);
        await tx.adminAuthToken.update({
            where: { id: adminAuthTokenPrisma.id },
            data: {
                reqTimestamps: validReqTimestamps.map(date => date.toISOString())
            }
        });

        return adminAuthTokenPrisma.admin;
    });

    return adminPrisma;
}



// USER ADMIN ACTIONS
export const banUser = async (where: Prisma.UserWhereUniqueInput, banMsg: string, banExpiration?: Date) => {
    await prisma.user.update({
        where,
        data: {
            banned: true,
            banMsg,
            banExpiration
        }
    });
}

export const markDeleteUser = async (where: Prisma.UserWhereUniqueInput) => {
    await prisma.user.update({
        where,
        data: { deleted: true }
    });
}

export const deleteUser = async (where: Prisma.UserWhereUniqueInput) => {
    await prisma.user.delete({ where });
}