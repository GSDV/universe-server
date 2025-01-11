'use server';

import { Prisma } from '@prisma/client';
import { makePasswordHash } from '@util/api/user';
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

// export const createActivateToken = async (displayName: string, username: string, email: string, password: string) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let token = '';
//     for (let i = 0; i < 6; i++) {
//         const randomIndex = Math.floor(Math.random() * characters.length);
//         token += characters[randomIndex];
//     }

//     const { hashedPassword, salt } = await makePasswordHash(password);

//     await prisma.activateToken.create({
//         data: { token, displayName, username, email, password: hashedPassword, salt }
//     });
//     return token;
// }


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