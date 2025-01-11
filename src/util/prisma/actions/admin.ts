'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@util/prisma/client';

import { cookies } from 'next/headers';

import { ADMIN_AUTH_TOKEN_COOKIE_KEY } from '@util/global-server';




// Get logged in admin.
export const getValidatedAdmin = async () => {
    const cookieStore = await cookies();
    const authTokenCookie = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE_KEY);
    if (!authTokenCookie || authTokenCookie.value === '') return null;

    const authToken = authTokenCookie.value;
    const adminPrisma = await getAdminFromAuth(authToken);
    if (!adminPrisma) return null;

    return adminPrisma;
}



const getAdminFromAuth = async (authtoken: string) => {
    const authTokenPrisma = await prisma.adminAuthToken.findFirst({
        where: { token: authtoken },
        include: { admin: true }
    });
    // Return null if auth token is expired
    if (!authTokenPrisma) return null;
    return authTokenPrisma.admin;
}



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