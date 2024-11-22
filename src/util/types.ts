import { Prisma } from '@prisma/client';

import { z } from 'zod';

import { MAX_POST_CONTENT_LENGTH, MAX_POST_MEDIA, MIN_POST_CONTENT_LENGTH } from './global';



export type User = Prisma.UserGetPayload<{}>;
export type RedactedUser = Prisma.UserGetPayload<{ omit: {password: true, salt: true} }>;
export type RedactedUserWithPosts = Prisma.UserGetPayload<{ omit: {password: true, salt: true}, include: {posts: true} }>;



export const createPostSchema = z.object({
    content: z.string().trim().min(MIN_POST_CONTENT_LENGTH, `Content must be longer than ${MIN_POST_CONTENT_LENGTH-1} characters.`).max(MAX_POST_CONTENT_LENGTH, `Content must be shorter than ${MAX_POST_CONTENT_LENGTH+1} characters.`),
    media: z.array(z.string()).min(0, `Something went wrong.`).max(MAX_POST_MEDIA, `A max of ${MAX_POST_MEDIA} media is allowed.`),
    hasLocation: z.boolean(),
    lat: z.number().min(-90, `Invalid latitude.`).max(90, `Invalid latitude.`).optional(),
    lng: z.number().min(-180, `Invalid longitude.`).max(180, `Invalid longitude.`).optional()
});
export type PostDataInput = z.infer<typeof createPostSchema>;



export const createReplySchema = z.object({
    content: z.string().trim().min(MIN_POST_CONTENT_LENGTH, `Content must be longer than ${MIN_POST_CONTENT_LENGTH-1} characters.`).max(MAX_POST_CONTENT_LENGTH, `Content must be shorter than ${MAX_POST_CONTENT_LENGTH+1} characters.`),
    media: z.array(z.string()).min(0, `Something went wrong.`).max(MAX_POST_MEDIA, `A max of ${MAX_POST_MEDIA} media is allowed.`)
});
export type ReplyDataInput = z.infer<typeof createReplySchema>;