'use server';

import { prisma } from '@util/prisma/client';
import { Prisma } from '@prisma/client';

import { COUNT_REPLIES, getUserLike, INCLUDE_AUTHOR, POST_PER_SCROLL } from '@util/global-server';



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
export const createReply = async (authorId: string, postData: ReplyDataInput) => {
    const postPrisma = await prisma.post.create({
        data: {
            authorId: authorId,
            hasLocation: false,
            ...postData
        },
        include: INCLUDE_AUTHOR
    });
    return postPrisma;
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
    await prisma.$transaction([
        prisma.like.create({
            data: {
                userId,
                postId
            }
        }),
        prisma.post.update({
            where: { id: postId },
            data: { likeCount: { increment: 1 } }
        })
    ]);
}
export const unlikePost = async (postId: string, userId: string) => {
    await prisma.$transaction([
        prisma.like.delete({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        }),
        prisma.post.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } }
        })
    ]);
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