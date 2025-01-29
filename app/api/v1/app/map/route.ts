import { NextRequest } from 'next/server';

import { prisma } from '@util/prisma/client';
import { getValidatedUser } from '@util/prisma/actions/user';

import { getUserLike, INCLUDE_AUTHOR, response } from '@util/global-server';

import { areValidScreenPoints, getScaledWrapperPoints, GRID_SIZE } from '@util/geo';
import { makeClientPosts, RetrievedPost } from '@util/api/posts';



/*
Client map is divided into "grid squares", where a grid square is defined by:
Bottom Left (BL) coords (lat and lng values scaled by GRID_SIZE and then truncated), plus GRID_SIZE in both lat and lng directions.

One grid square:
    .______TR
    |       |
    |       |
    BL______.

Grid squares are used as keys to the hashmap holding the posts that lie within the grid itself.
Grid squares are defined by actual lat and lng coords, scaled by GRID_SIZE, and then truncated.

We also pass "screen_bl" and "screen_tr", which define the entire part of the map displayed to the user.
These points will not line up directly with grid square corners, even after scaling.
They must be scaled and rounded up or down, depending on the corner.
*/



// Used for fetching hot/trending posts to display on the feed screen.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const screenCoordsString = searchParams.get('screenCoords');
        if (!screenCoordsString) return response('No coordinates provided', 101);

        const { screen_bl, screen_tr} = JSON.parse(screenCoordsString);

        if (!screen_bl || !screen_tr) return response('No coordinates provided', 101);
        if (!areValidScreenPoints(screen_bl, screen_tr)) return response('Invalid points.', 102);
        const { w_bl, w_tr } = getScaledWrapperPoints(screen_bl, screen_tr);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        // Posts need to be less than 3 days old in order to be displayed.
        const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        const lat_step = (w_tr.lat - w_bl.lat) / 5;
        const lng_step = (w_tr.lng - w_bl.lng) / 4;
    
        // try doing one prisma call (not transaction) with OR and AND and .map() instead of this
        const hashmap = await prisma.$transaction(async (tx) => {
            const map = new Map<string, RetrievedPost[]>();

            for (
                let lat_ptr = w_bl.lat;
                lat_ptr < w_tr.lat;
                lat_ptr += lat_step
            ) {
                for (
                    let lng_ptr = w_bl.lng;
                    lng_ptr < w_tr.lng;
                    lng_ptr += lng_step
                ) {
                    const gridPosts = await tx.post.findMany({
                        where: {
                            deleted: false,
                            replyToId: null,
                            displayDate: { gte: cutoff },
                            lat: { gte: lat_ptr / GRID_SIZE, lte: (lat_ptr+lat_step) / GRID_SIZE },
                            lng: { gte: lng_ptr / GRID_SIZE, lte: (lng_ptr+lng_step) / GRID_SIZE }
                        },
                        include: { ...INCLUDE_AUTHOR, likes: getUserLike(loggedInUserId) },
                        orderBy: [{likeCount: 'desc'}, {replyCount: 'desc'}, {displayDate: 'desc' }],
                        take: 10
                    });
                    if (gridPosts.length != 0) map.set(`${lat_ptr},${lng_ptr}`, gridPosts);
                }
            }

            return map;
        });

        const clientPosts = makeClientPosts([...hashmap.values()].flat());

        return response(`Success.`, 200, { posts: clientPosts });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}