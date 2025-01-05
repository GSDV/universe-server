import { response } from '@util/global-server';

import { createPostSchema, createReplySchema, Post, RedactedUserWithUni } from '@util/types';



export const validateCreatePostData = (input: any) => {
    const postData = createPostSchema.safeParse(input);
    if (!postData.success) {
        // Only consider first error
        const error = postData.error.errors[0];
        return { valid: false, resp: response(`Error making post: ${error.message}`, 102) };
    }
    return { valid: true, data: postData.data };
}



export const validateCreateReplyData = (input: any) => {
    const replyData = createReplySchema.safeParse(input);
    if (!replyData.success) {
        // Only consider first error
        const error = replyData.error.errors[0];
        return { valid: false, resp: response(`Error making post: ${error.message}`, 102) };
    }
    return { valid: true, data: replyData.data };
}



interface RetrievedPost extends Post {
    author: RedactedUserWithUni;
    likes: { id: string }[];
}
interface ClientPost extends Omit<Post, 'lat' | 'lng'> {
    lat: Number | null;
    lng: Number | null;
    author: RedactedUserWithUni;
    isLiked: boolean;
}
export const makeClientPosts = (posts: RetrievedPost[]) => {
    const clientPosts: ClientPost[] = posts.map(p => ({
        ...p,
        lat: (p.lat) ? Number(p.lat) : null,
        lng: (p.lng) ? Number(p.lng) : null,
        isLiked: (p.likes.length > 0)
    }));
    return clientPosts;
}