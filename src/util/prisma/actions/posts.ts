'use server';

import { prisma } from '@util/prisma/client';
import { Prisma } from '@prisma/client';

import { COUNT_REPLIES, getUserLike, INCLUDE_AUTHOR, POST_PER_SCROLL } from '@util/global-server';
import { Post, PostWithThread } from '@util/types';
import { makeClientPosts } from '@util/api/posts';



interface PostDataInput {
    content: string;
    media: string[];
    hasLocation: boolean;
    lat?: number;
    lng?: number;
}
export const createPost = async (authorId: string, postData: PostDataInput) => {
    const postPrisma = await prisma.post.create({
        data: {
            authorId: authorId,
            ...postData
        },
        include: INCLUDE_AUTHOR
    });
    return postPrisma;
}



interface ReplyDataInput {
    content: string;
    media: string[];
}
export const createReply = async (authorId: string, replyData: ReplyDataInput, parentPost: PostWithThread) => {
    const { id: replyToId, threadPosts } = parentPost;

    const res = await prisma.$transaction(async (tx) => {
        const replyPost = await tx.post.create({
            data: {
                content: replyData.content,
                media: replyData.media || [],
                hasLocation: false,
                authorId,
                replyToId,
                threadPosts: {
                    connect: [
                        ...threadPosts.map(post => ({ id: post.id })),
                        { id: replyToId }
                    ]
                }
            },
            include: INCLUDE_AUTHOR
        });

        await tx.post.update({
            where: { id: replyToId },
            data: { replyCount: { increment: 1 } }
        });

        return replyPost;
    });

    return res;
}



export const getPostWithAncestors = async (where: Prisma.PostWhereUniqueInput) => {
    const post = await prisma.post.findUnique({
        where,
        include: {
            ...INCLUDE_AUTHOR,
            threadPosts: { include: INCLUDE_AUTHOR }
        }
    });
    return post;
}

export const getPostWithAncestorsClient = async (where: Prisma.PostWhereUniqueInput, loggedInUserId: string) => {
    const post = await prisma.post.findUnique({
        where,
        include: {
            ...INCLUDE_AUTHOR,
            likes: getUserLike(loggedInUserId),
            threadPosts: {
                orderBy: { createdAt: 'asc' },
                include: { ...INCLUDE_AUTHOR, likes: getUserLike(loggedInUserId) },
            }
        }
    });

    if (!post) return null;

    // Redact deleted posts, but still send them back.
    // Not sending them back breaks the ancestor thread.
    post.threadPosts = post.threadPosts.map(p => (
        (p.deleted) ?
            ({
                ...p,
                content: '',
                media: [],
                isLiked: p.likes.length > 0
            })
        :
            ({
                ...p,
                isLiked: p.likes.length > 0
            })
    ));

    return post;
}



export const updatePost = async (where: Prisma.PostWhereUniqueInput, data: Prisma.PostUpdateInput) => {
    await prisma.post.update({
        where,
        data
    });
}

export const updatePosts = async (where: Prisma.PostWhereInput, data: Prisma.PostUpdateInput) => {
    await prisma.post.updateMany({
        where,
        data
    });
}



export const markPostDelete = async (postId: string, authorId: string) => {
    await prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({
            where: {
                id: postId,
                authorId,
                deleted: false
            },
            select: {
                replyToId: true
            }
        });

        await tx.post.update({
            where: {
                id: postId,
                authorId,
                deleted: false
            },
            data: {
                deleted: true,
                pinned: false
            }
        });

        if (post?.replyToId) {
            const parentPost = await tx.post.findUnique({
                where: { id: post.replyToId },
                select: { replyCount: true }
            });

            if (parentPost && parentPost.replyCount > 0) {
                await tx.post.update({
                    where: { id: post.replyToId },
                    data: {
                        replyCount: { decrement: 1 }
                    }
                });
            }
        }
    });
}



export const likePost = async (postId: string, userId: string) => {
    await prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({
            where: { id: postId },
            select: { deleted: true }
        });

        if (!post || post.deleted) return null;

        const like = await tx.like.create({
            data: { userId, postId }
        });

        await tx.post.update({
            where: { id: postId },
            data: { likeCount: { increment: 1 } }
        });

        return like;
    });
}

export const unlikePost = async (postId: string, userId: string) => {
    await prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({
            where: { id: postId },
            select: { deleted: true }
        });

        if (!post || post.deleted) return null;

        const like = await tx.like.delete({
            where: {
                userId_postId: { userId, postId }
            }
        });

        await tx.post.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } }
        });

        return like;
    });
}



// Only fetch a user's pinned post
export const fetchPinnedPost = async (authorId: string, loggedInUserId: string) => {
    const pinnedPost = await prisma.post.findFirst({
        where: { authorId, pinned: true, deleted: false },
        include: { ...INCLUDE_AUTHOR, likes: getUserLike(loggedInUserId), ...COUNT_REPLIES }
    });
    if (!pinnedPost) return null;

    const clientPinnedPost = {
        ...pinnedPost,
        isLiked: pinnedPost.likes.length > 0,
        replyCount: pinnedPost._count.replies
    };

    return clientPinnedPost;
}



export const fetchClientBatchPosts = async (
    where: Prisma.PostWhereInput,
    cursor: string,
    loggedInUserId: string,
    orderBy: (Prisma.PostOrderByWithRelationInput | Prisma.Enumerable<Prisma.PostOrderByWithRelationInput>) = { createdAt: 'desc' }
) => {
    const posts = await prisma.post.findMany({
        where,
        include: { ...INCLUDE_AUTHOR, likes: getUserLike(loggedInUserId) },
        orderBy,
        take: POST_PER_SCROLL + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        })
    });

    const clientPosts = makeClientPosts(posts);

    const moreAvailable = clientPosts.length > POST_PER_SCROLL;
    if (moreAvailable) clientPosts.pop();

    const nextCursor = (clientPosts.length!=0) ? clientPosts[clientPosts.length - 1].id : '';

    return { clientPosts, nextCursor, moreAvailable };
}