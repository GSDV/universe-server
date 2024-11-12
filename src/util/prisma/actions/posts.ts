'use server';

import { prisma } from '@util/prisma/client';
import { Prisma } from '@prisma/client';

import { COUNT_REPLIES, getUserLike, POST_PER_SCROLL, REDACT_USER_OMITS } from '@util/global-server';



interface postDataInput {
    content: string,
    media: string[],
    hasLocation: boolean,
    lat?: number,
    lng?: number
}
export const createPost = async (authorId: string, postData: postDataInput) => {
    const postPrisma = await prisma.post.create({
        data: {
            authorId: authorId,
            ...postData
        }
    });
    return postPrisma;
}



// Will only fetch non-pinned, root posts.
export const fetchRootPosts = async (authorId: string, pageNumber: number, loggedInUserId: string) => {
    const posts = await prisma.post.findMany({
        where: { authorId, pinned: false, replyToId: null },
        orderBy: { displayDate: 'desc' },
        include: { author: { include: { university: true }, ...REDACT_USER_OMITS }, likes: getUserLike(loggedInUserId), ...COUNT_REPLIES },
        skip: POST_PER_SCROLL*(pageNumber-1),
        take: POST_PER_SCROLL + 1 // Fetch one more to see if there are more posts available
    });

    const clientPosts = posts.map(p => ({
            ...p,
            isLiked: p.likeCount != 0,
            replyCount: p._count.replies
    }));

    const moreAvailable = clientPosts.length > POST_PER_SCROLL;
    if (moreAvailable) clientPosts.pop();
    return { posts: clientPosts, moreAvailable };
}

// Only fetch a user's pinned post
export const fetchPinnedPost = async(authorId: string, loggedInUserId: string) => {
    const pinnedPost = await prisma.post.findFirst({
        where: { authorId, pinned: true },
        include: { author: { include: { university: true }, ...REDACT_USER_OMITS }, likes: getUserLike(loggedInUserId), ...COUNT_REPLIES }
    });
    if (!pinnedPost) return null;

    const clientPinnedPost = {
        ...pinnedPost,
        isLiked: pinnedPost.likeCount != 0,
        replyCount: pinnedPost._count.replies
    };

    return clientPinnedPost;
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
            deleted: true
        }
    });

    return res.count;
}