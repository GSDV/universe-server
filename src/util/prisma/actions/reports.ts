'use server';

import { prisma } from '@util/prisma/client';



export const createReport = async (reporterId: string, reportedPostId: string, msg: string) => {
    const reportPrisma = await prisma.postReport.create({
        data: { reportedPostId, reporterId, msg }
    });
    return reportPrisma;
}



export const getReport = async (reporterId: string, reportedPostId: string) => {
    const reportPrisma = await prisma.postReport.findFirst({
        where: { reportedPostId, reporterId }
    });
    return reportPrisma;
}