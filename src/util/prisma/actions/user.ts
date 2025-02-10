'use server';

import { prisma } from '@util/prisma/client';

import { cookies } from 'next/headers';

import { Prisma } from '@prisma/client';

import { AUTH_TOKEN_COOKIE_KEY } from '@util/global';
import { getUserBlocking, getUserBlocks, getUserFollow, OMIT_USER, PROFILE_PER_SCROLL, response } from '@util/global-server';

import { isValidUser, makeClientUsers, makePasswordHash, redactUserPrisma } from '@util/api/user';



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
    const userPrisma = await prisma.user.findFirst({
        where,
        include: {
            university: true
        }
    });
    return userPrisma;
}



export const getProfileUser = async (where: Prisma.UserWhereInput, loggedInUserId: string) => {
    const userPrisma = await prisma.user.findFirst({
        where,
        include: {
            university: true,
            followers: getUserFollow(loggedInUserId),
            blockedBy: getUserBlocking(loggedInUserId),
            blocks: getUserBlocks(loggedInUserId),
        }
    });
    if (!userPrisma) return null;

    // isBlocking: Logged in user is blocking this account
    // isBlockedBy: Logged in user is blocked by this account
    const clientUserPrisma = {
        ...userPrisma,
        isFollowed: userPrisma.followers.length > 0,
        isBlocking: userPrisma.blockedBy.length > 0,
        isBlockedBy: userPrisma.blocks.length > 0
    }

    return clientUserPrisma;
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



export const toggleFollow = async (targetId: string, sourceId: string, followed: boolean) => {
    await prisma.$transaction(async (tx) => {
        if (followed) {
            await tx.follow.upsert({
                where: {
                    followerId_followingId: {
                        followerId: sourceId,
                        followingId: targetId
                    }
                },
                create: {
                    followerId: sourceId,
                    followingId: targetId
                },
                update: {}
            });

            await Promise.all([
                tx.user.update({
                    where: { id: targetId },
                    data: { followerCount: { increment: 1 } }
                }),
                tx.user.update({
                    where: { id: sourceId },
                    data: { followingCount: { increment: 1 } }
                })
            ]);
        } else {
            const followRecord = await tx.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: sourceId,
                        followingId: targetId
                    }
                }
            }).catch(() => null);

            if (followRecord) {
                await Promise.all([
                    tx.user.update({
                        where: { id: targetId },
                        data: { followerCount: { decrement: 1 } }
                    }),
                    tx.user.update({
                        where: { id: sourceId },
                        data: { followingCount: { decrement: 1 } }
                    })
                ]);
            }
        }
    });
}



export const toggleBlock = async (targetId: string, sourceId: string, blocked: boolean) => {
    await prisma.$transaction(async (tx) => {
        if (blocked) {
            await tx.block.upsert({
                where: {
                    blockerId_blockedId: {
                        blockerId: sourceId,
                        blockedId: targetId
                    }
                },
                create: {
                    blockerId: sourceId,
                    blockedId: targetId
                },
                update: {}
            });

            const sourceToTargetFollow = await tx.follow.deleteMany({
                where: {
                    followerId: sourceId,
                    followingId: targetId
                }
            });
            const targetToSourceFollow = await tx.follow.deleteMany({
                where: {
                    followerId: targetId,
                    followingId: sourceId
                }
            });

            if (sourceToTargetFollow.count > 0) {
                await Promise.all([
                    tx.user.update({
                        where: { id: targetId },
                        data: { followerCount: { decrement: 1 } }
                    }),
                    tx.user.update({
                        where: { id: sourceId },
                        data: { followingCount: { decrement: 1 } }
                    })
                ]);
            }

            if (targetToSourceFollow.count > 0) {
                await Promise.all([
                    tx.user.update({
                        where: { id: sourceId },
                        data: { followerCount: { decrement: 1 } }
                    }),
                    tx.user.update({
                        where: { id: targetId },
                        data: { followingCount: { decrement: 1 } }
                    })
                ]);
            }
        } else {
            await tx.block.delete({
                where: {
                    blockerId_blockedId: {
                        blockerId: sourceId,
                        blockedId: targetId
                    }
                }
            }).catch(() => null);
        }
    });
}



// Mark user and all posts as delete.
export const markUserDelete = async (userId: string) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.post.updateMany({
            where: { authorId: userId },
            data: { deleted: true }
        });

        const deletedUser = await tx.user.update({
            where: { id: userId },
            data: { deleted: true }
        });

        return deletedUser;
    });
    return result.id;
}



export const fetchClientBatchUsers = async (where: Prisma.UserWhereInput, cursor: string, loggedInUserId: string) => {
    const users = await prisma.user.findMany({
        where,
        include: { university: true, followers: getUserFollow(loggedInUserId) },
        orderBy: { createdAt: 'desc' },
        take: PROFILE_PER_SCROLL + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        })
    });

    const clientUsers = makeClientUsers(users);

    const nextCursor = (clientUsers.length!=0) ? clientUsers[clientUsers.length - 1].id : '';

    const moreAvailable = clientUsers.length > PROFILE_PER_SCROLL;
    if (moreAvailable) clientUsers.pop();

    return { clientUsers, nextCursor, moreAvailable };
}