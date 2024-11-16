// This file must be identical to the client repo's 'src/util/global.ts'



export const DOMAIN = 'http://localhost:3005';
export const BRAND = 'UniVerse';
export const CONTACT_EMAIL = 'contact@universe.com';



// COOKIES
export const AUTH_TOKEN_COOKIE_KEY = 'auth_token';
export const USER_ID_COOKIE_KEY = 'id_token';



// UI
export const ACCOUNT_POSTS_PER_BATCH = 15;



// USER RESTRICTIONS
export const MIN_USERNAME_LENGTH = 4;
export const MAX_USERNAME_LENGTH = 25;



// POST RESTRICTIONS
export const MIN_POST_CONTENT_LENGTH = 2;
export const MAX_POST_CONTENT_LENGTH = 200;
export const MAX_POST_MEDIA = 4;

export const ACCEPTED_IMGS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const ACCEPTED_VIDS = ['video/mp4', 'video/quicktime'];
export const ACCEPTED_FILES = [...ACCEPTED_IMGS, ...ACCEPTED_VIDS];
export const IMG_SIZE_LIMIT = 10 * 1000000;
export const IMG_SIZE_LIMIT_TXT = `10mb`;
export const VID_SIZE_LIMIT = 50 * 1000000;
export const VID_SIZE_LIMIT_TXT = `50mb`;



// Media Links
export const mediaKeyPrefix = (authorId: string) => `users/${authorId}/posts/`;
export const mediaUrl = (mediaKey: string) => `https://uni-verse.s3.us-east-2.amazonaws.com/${mediaKey}`;