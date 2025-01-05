
import { NextRequest } from 'next/server';

import { waitUntil } from '@vercel/functions';

import { response, MAX_ACTIVATE_TOKEN_ATTEMPTS } from '@util/global-server';

import { createUser, getUser } from '@util/prisma/actions/user';
import { createActivateToken, createAuthToken, deleteActivateTokens, getActivateToken, incrementActivateTokenAttempts } from '@util/prisma/actions/tokens';

import { isActivateTokenExpired } from '@util/api/tokens';
import { isValidDisplayName, isValidEmail, isValidPassword, isValidUsername } from '@util/api/user';



// Create ActivationToken and send a verification email.
// This is handler used for the first AND subsequent (resends) ActivateToken creations.
export async function POST(req: NextRequest) {
    try {
        const { data } = await req.json();

        if (!data) return response(`No data provided.`, 101);
        let { displayName, username, email, password } = data;

        if (typeof displayName != 'string' || typeof username != 'string' || typeof email != 'string' || typeof password != 'string') return response(`Missing data fields.`, 101);

        if (displayName == '' || !isValidDisplayName(displayName)) return response(`Display names must be 1-30 characters.`, 102);
        if (username == '' || !isValidUsername(username)) return response(`Usernames must be 4-20 characters, and start with a letter.`, 102);
        if (email == '' || !isValidEmail(email)) return response(`Please use your school "...@edu" email.`, 102);
        if (password == '' || !isValidPassword(password)) return response(`Use a password with 5 to 50 characters, consisting only of letters, numbers, and the symbols #, $, %, and &.`, 102);

        const userEmailPrisma = await getUser({ email });
        if (userEmailPrisma) return response(`Account with this email already exists.`, 405);
        const userUsernamePrisma = await getUser({ username });
        if (userUsernamePrisma) return response(`Username is already taken.`, 405);

        const prevActivationToken = await getActivateToken({ email });
        if (!isActivateTokenExpired(prevActivationToken)) return response(`Please wait before requesting another verification email.`, 510);
        await deleteActivateTokens({ email });

        const activationToken = await createActivateToken(email);
        // const sgCode = await sendActivationEmail(email, activationToken);
        // if (sgCode!=200 && sgCode!=201 && sgCode!=204) response(`Unknown email error. Please try again.`, 801);

        return response(`Check your email to activate your account.`, 200);
    } catch (err: any) {
        return response(`Server error.`, 903);
    }
}



// Attempt to verify account with code.
// If successful, send back an auth token so user does not have to re-login.
export async function PUT(req: NextRequest) {
    try {
        const { data, codeStr } = await req.json();

        if (!data || !codeStr || (typeof codeStr !== 'string')) return response(`No data provided.`, 101);
        let { displayName, username, email, password } = data;

        if (typeof displayName != 'string' || typeof username != 'string' || typeof email != 'string' || typeof password != 'string') return response(`Missing data fields, go back.`, 101);

        if (displayName == '' || !isValidDisplayName(displayName)) return response(`Display names must be 1-30 characters.`, 102);
        if (username == '' || !isValidUsername(username)) return response(`Usernames must be 4-20 characters, and start with a letter.`, 102);
        if (email == '' || !isValidEmail(email)) return response(`Please use your school "...@edu" email.`, 102);
        if (password == '' || !isValidPassword(password)) return response(`Use a password with 5 to 50 characters, consisting only of letters, numbers, and the symbols #, $, %, and &.`, 102);

        const userEmailPrisma = await getUser({ email });
        if (userEmailPrisma) return response(`Account with this email already exists.`, 405);
        const userUsernamePrisma = await getUser({ username });
        if (userUsernamePrisma) return response(`Username is already taken.`, 405);

        const activateTokenPrisma = await getActivateToken({ email, expired: false });
        if (!activateTokenPrisma) return response(`Request a new verification email.`, 501);
        if (activateTokenPrisma.attempts >= MAX_ACTIVATE_TOKEN_ATTEMPTS) return response(`You have attempted too many times, request a new verification email.`, 530);
        if (isActivateTokenExpired(activateTokenPrisma)) {
            waitUntil(deleteActivateTokens({ email }));
            return response(`Request a new verification email.`, 502);
        }

        if (codeStr.toUpperCase() !== activateTokenPrisma.token) {
            waitUntil(incrementActivateTokenAttempts(activateTokenPrisma.id));
            return response(`Wrong activation code.`, 501);
        }

        const user = await createUser(displayName, username, email, password);
        const authToken = await createAuthToken(user.id);

        waitUntil(deleteActivateTokens({ email }));
        return response(`Success! Your account has been activated.`, 200, { user, authToken });
    } catch (err: any) {
        return response(`Server error.`, 903);
    }
}