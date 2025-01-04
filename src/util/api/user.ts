import bcrypt from 'bcryptjs';

import { response } from '@util/global-server';

import { RedactedUserWithUni, User } from '@util/types';



export const allFieldsPresent = (formData: any) => {
    return (
        formData.displayName!=null && 
        formData.displayName!='' && 
        formData.email!=null && 
        formData.email!='' && 
        formData.password!=null && 
        formData.password!=''
    );
}



export const isValidEmail = (input: string) => {
    const pattern = /^[a-z0-9]+@[a-z]+\.edu$/;
    return pattern.test(input);
}


export const isValidPassword = (input: string) => {
    const pattern = /^[a-zA-Z0-9#$&%]+$/;
    return pattern.test(input) && input.length <= 50 && input.length >= 5;
}



export const isValidUser = (user: User | null) => {
    if (user == null) return { valid: false, res: response(`You are not logged in.`, 404) };
    if (user.deleted) return { valid: false, res: response(`Account has been deleted.`, 411) };
    if (user.banned) return { valid: false, res: response(`Account has been banned.`, 410) };
    return { valid: true };
}



export const redactUserPrisma = (user: any): RedactedUserWithUni => {
    return {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        pfpKey: user.pfpKey,
        bio: user.bio,
        universityId: user.universityId,
        university: user.university,
        verified: user.verified,
        followerCount: user.followerCount,
        followingCount: user.followingCount
    }
}



export const makePasswordHash = async (input: string) => {
    const salt_rounds = Number(process.env.SALT_ROUNDS as string);
    const salt = await bcrypt.genSalt(salt_rounds);
    const hashedPassword = await hashPassword(input, salt);
    return { hashedPassword, salt };
}

export const hashPassword = async (input: string, salt: string) => {
    const hashedPassword = await bcrypt.hash(input, salt);
    return hashedPassword;
}