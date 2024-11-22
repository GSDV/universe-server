import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';

import { MAX_REPORT_LENGTH } from '@util/global';
import { response } from '@util/global-server';

import { createReport, getReport } from '@util/prisma/actions/reports';



export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const { reportText } = await req.json();
        const postId = (await params).postId;

        if (!reportText || !postId) return response(`Missing data fields.`, 101);

        const report = reportText.trim();
        if (report.length == 0) return response(`Report text is empty.`, 102);
        if (report.length > MAX_REPORT_LENGTH) return response(`Report text is too long.`, 102);

        const resValidUser = await getValidatedUser();
        if (!resValidUser.user) return resValidUser.resp;
        const userPrisma = resValidUser.user;

        const reportPrisma = await getReport(userPrisma.id, postId);
        // If it is not null, the user already reported the post.
        if (reportPrisma) return response(`This user has already reported this post.`, 440);

        await createReport(userPrisma.id, postId, report);

        return response(`Success`, 200);
    } catch (err) {
        return response(`Server error: ${err}`, 900);
    }
}