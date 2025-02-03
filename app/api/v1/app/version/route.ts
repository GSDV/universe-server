import { NextRequest } from 'next/server';

import { response } from '@util/global-server';



// Used to check if user has the latest version of the app.
// Calling this version of the api will tell us if the user should update or not.
export async function GET(req: NextRequest) {
     // In the future, we will use the following to phase out old versions of the app:
     return response(`A new version of the app is available. Please update.`, 150);

    return response(`Using up-to-date version`, 200);
}