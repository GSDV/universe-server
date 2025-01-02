'use server';

import { prisma } from '@util/prisma/client';
import { Prisma } from '@prisma/client';

import { COUNT_REPLIES, getUserLike, INCLUDE_AUTHOR, POST_PER_SCROLL } from '@util/global-server';
import { Post, PostWithThread } from '@util/types';



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



export const getPost = async (where: Prisma.PostWhereUniqueInput) => {
    const post = await prisma.post.findUnique({
        where,
        include: INCLUDE_AUTHOR
    });
    return post;
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
                orderBy: { displayDate: 'asc' },
                include: { ...INCLUDE_AUTHOR, likes: getUserLike(loggedInUserId) },
            }
        }
    });

    if (!post) return null;

    post.threadPosts = post.threadPosts.map(p => ({
        ...p,
        isLiked: p.likes.length > 0,
    }));
    return post;
}



export const getRepliesClient = async (replyToId: string, pageNumber: number, loggedInUserId: string) => {
    const replies = await prisma.post.findMany({
        where: { replyToId },
        include: {
            ...INCLUDE_AUTHOR,
            likes: getUserLike(loggedInUserId),
        },
        skip: POST_PER_SCROLL*(pageNumber-1),
        take: POST_PER_SCROLL + 1
    });

    const clientReplies = replies.map(p => ({
        ...p,
        isLiked: p.likes.length > 0
    }));

    const moreRepliesAvailable = clientReplies.length > POST_PER_SCROLL;
    if (moreRepliesAvailable) clientReplies.pop();
    return { replies: clientReplies, moreRepliesAvailable };
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
    const res = await prisma.post.updateMany({
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
    return res.count;
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



// Will only fetch non-pinned, root posts.
export const fetchRootPosts = async (authorId: string, pageNumber: number, loggedInUserId: string) => {
    const posts = await prisma.post.findMany({
        where: { authorId, pinned: false, replyToId: null, deleted: false },
        orderBy: { displayDate: 'desc' },
        include: { ...INCLUDE_AUTHOR, likes: getUserLike(loggedInUserId), ...COUNT_REPLIES },
        skip: POST_PER_SCROLL*(pageNumber-1),
        take: POST_PER_SCROLL + 1 // Fetch one more to see if there are more posts available
    });

    const clientPosts = posts.map(p => ({
            ...p,
            isLiked: p.likes.length > 0, // Because we only fetch the user's like, see if the length is above 0
            replyCount: p._count.replies
    }));

    const morePostsAvailable = clientPosts.length > POST_PER_SCROLL;
    if (morePostsAvailable) clientPosts.pop();
    return { posts: clientPosts, morePostsAvailable };
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

export const fetchAccountReplies = async (authorId: string, pageNumber: number, loggedInUserId: string) => {
    const replies = await prisma.post.findMany({
        where: { authorId, pinned: false, replyToId: {not: null}, deleted: false },
        orderBy: { displayDate: 'desc' },
        include: { ...INCLUDE_AUTHOR, likes: getUserLike(loggedInUserId), ...COUNT_REPLIES },
        skip: POST_PER_SCROLL*(pageNumber-1),
        take: POST_PER_SCROLL + 1
    });

    const clientReplies = replies.map(r => ({
            ...r,
            isLiked: r.likes.length > 0,
            replyCount: r._count.replies
    }));

    const moreRepliesAvailable = clientReplies.length > POST_PER_SCROLL;
    if (moreRepliesAvailable) clientReplies.pop();
    return { replies: clientReplies, moreRepliesAvailable };
}