import { ActivateToken } from '@prisma/client';

import { ACTIVATE_TOKEN_EXPIRATION } from '@util/global-server';



export const isLastActivateTokenExpired = (tokens: ActivateToken[]) => {
    if (tokens.length==0) return true;
    const lastToken = tokens[tokens.length-1];
    return isActivateTokenExpired(lastToken);  
}

export const isActivateTokenExpired = (token: ActivateToken | null) => {
    if (!token) return true;

    const tokenTime = token.createdAt;
    const currentTime = new Date();

    const timeDifference = currentTime.getTime() - tokenTime.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    return minutesDifference > ACTIVATE_TOKEN_EXPIRATION;
}