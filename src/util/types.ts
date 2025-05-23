import { Prisma } from '@prisma/client';

import { z } from 'zod';

import { MAX_POST_CONTENT_LENGTH, MAX_POST_MEDIA, MIN_POST_CONTENT_LENGTH } from './global';



export type REDACT_USER_OMITS_TYPE = {
    createdAt: true,
    updatedAt: true,
    email: true,
    password: true,
    salt: true,
    deleted: true,
    banned: true,
    banExpiration: true,
    banMsg: true
};

export type User = Prisma.UserGetPayload<{}>;
export type UserWithUni = Prisma.UserGetPayload<{ include: {university: true} }>;
export type RedactedUser = Prisma.UserGetPayload<{ omit: REDACT_USER_OMITS_TYPE }>;
export type RedactedUserWithUni = Prisma.UserGetPayload<{ omit: REDACT_USER_OMITS_TYPE, include: {university: true} }>;
export type RedactedUserWithPosts = Prisma.UserGetPayload<{ omit: REDACT_USER_OMITS_TYPE, include: {posts: true} }>;

export type Post = Prisma.PostGetPayload<{}>;
export type PostWithThread = Prisma.PostGetPayload<{ include: {threadPosts: true} }>;



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