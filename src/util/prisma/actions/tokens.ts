'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@util/prisma/client';

import { v4 as uuidv4 } from 'uuid';



export const createAuthToken = async (userId: string) => {
    const token = uuidv4();
    await prisma.authToken.create({
        data: {
            token: token,
            user: { connect: { id: userId } }
        }
    });
    return token;
}

export const deleteAllAuthToken = async (userId: string) => {
    await prisma.authToken.deleteMany({
        where: { userId }
    });
}

export const deleteAuthToken = async (authToken: string) => {
    await prisma.authToken.delete({
        where: { token: authToken }
    });
}



export const createActivateToken = async (email: string) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters[randomIndex];
    }

    await prisma.activateToken.create({
        data: { token, email }
    });
    return token;
}



export const getActivateToken = async (where: Prisma.ActivateTokenWhereInput) => {
    const tokenPrisma = await prisma.activateToken.findFirst({ where });
    return tokenPrisma;
}

export const deleteActivateTokens = async (where: Prisma.ActivateTokenWhereInput) => {
    const tokenPrisma = await prisma.activateToken.deleteMany({ where });
    return tokenPrisma;
}



export const incrementActivateTokenAttempts = async (tokenId: string) => {
    await prisma.activateToken.update({
        where: { id: tokenId },
        data: { attempts: { increment: 1 } }
    });
}


export const markActivateTokenAsExpired = async (tokenId: string) => {
    await prisma.activateToken.update({
        where: { id: tokenId },
        data: { expired: true }
    });
}



export const createRPToken = async (userId: string) => {
    const token = uuidv4();
    await prisma.rPToken.create({
        data: {
            token: token,
            user: { connect: { id: userId } }
        }
    });
    return token;
}

export const getRPToken = async (where: Prisma.RPTokenWhereInput) => {
    const tokenPrisma = await prisma.rPToken.findFirst({
        where,
        include: { user: true }
    });
    return tokenPrisma;
}

export const deleteRPTokens = async (where: Prisma.RPTokenWhereInput) => {
    const tokenPrisma = await prisma.rPToken.deleteMany({ where });
    return tokenPrisma;
}