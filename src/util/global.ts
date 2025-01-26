// This file must be identical to the client repo's 'src/util/global.ts'



export const BRAND = 'UniVerse';
export const CONTACT_EMAIL = 'contact@joinuniverse.app';



// COOKIES
export const AUTH_TOKEN_COOKIE_KEY = 'auth_token';
export const USER_ID_COOKIE_KEY = 'id_token';



// UI
export const ACCOUNT_POSTS_PER_BATCH = 15;



// USER RESTRICTIONS
export const MIN_USERNAME_LENGTH = 4;
export const MAX_USERNAME_LENGTH = 25;
export const isValidUsername = (input: string) => {
    const pattern = /^[a-z][a-zA-Z0-9]+$/;
    return (
        input.length >= MIN_USERNAME_LENGTH && 
        input.length <= MAX_USERNAME_LENGTH && 
        input[0] != '.' && 
        input[input.length-1] != '.' && 
        pattern.test(input)
    );
}

export const MIN_DISPLAY_NAME_LENGTH = 1;
export const MAX_DISPLAY_NAME_LENGTH = 30;
export const isValidDisplayName = (input: string) => (
    input.length >= MIN_DISPLAY_NAME_LENGTH && 
    input.length <= MAX_DISPLAY_NAME_LENGTH
);

export const MAX_BIO_LENGTH = 150;
export const isValidBio = (input: string) => (
    input.length <= MAX_BIO_LENGTH
);



// POST RESTRICTIONS
export const MIN_POST_CONTENT_LENGTH = 2;
export const MAX_POST_CONTENT_LENGTH = 200;
export const MIN_REPLY_CONTENT_LENGTH = 2;
export const MAX_REPLY_CONTENT_LENGTH = 200;
export const MAX_POST_MEDIA = 4;

export const MIME_TYPE_MAP = new Map<string, string>([
    ['image/jpeg', '.jpeg'],
    ['image/jpg', '.jpg'],
    ['image/png', '.png'],
    ['video/mp4', '.mp4'],
    ['image/webp', '.webp'],
    ['video/quicktime', '.mov']
]);
export const ACCEPTED_IMGS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const ACCEPTED_VIDS = ['video/mp4', 'video/quicktime'];
export const ACCEPTED_FILES = [...ACCEPTED_IMGS, ...ACCEPTED_VIDS];
export const IMG_SIZE_LIMIT = 10 * 1000000;
export const IMG_SIZE_LIMIT_TXT = `10mb`;
export const AVATAR_SIZE_LIMIT = 20 * 1000;
export const AVATAR_SIZE_LIMIT_TXT = `20kb`;
export const VID_SIZE_LIMIT = 50 * 1000000;
export const VID_SIZE_LIMIT_TXT = `50mb`;

export const MAX_REPORT_LENGTH = 250;



// AWS S3 Links
export const avatarKeyPrefix = (authorId: string) => `users/${authorId}/avatar/`;
export const mediaKeyPrefix = (authorId: string) => `users/${authorId}/posts/`;
export const mediaUrl = (mediaKey: string) => `https://uni-verse.s3.us-east-2.amazonaws.com/${mediaKey}`;