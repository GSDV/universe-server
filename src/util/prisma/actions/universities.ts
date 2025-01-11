'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@util/prisma/client';



export const getUni = async (where: Prisma.UniversityWhereUniqueInput) => {
    const uniPrisma = await prisma.university.findFirst({
        where
    });
    return uniPrisma;
}



export const createUni = async (domain: string, name: string, color: string) => {
    const normalizedDomain = domain.trim().toLowerCase();
    if (!normalizedDomain.endsWith('.edu')) return null;

    const result = await prisma.$transaction(async (tx) => {
        const uniPrisma = await tx.university.create({
            data: {
                domain: normalizedDomain,
                name: name.trim(),
                color: color.trim()
            }
        });

        const updatedUsers = await tx.user.updateMany({
            where: {
                email: { endsWith: normalizedDomain },
                universityId: null
            },
            data: {
                universityId: uniPrisma.id
            }
        });

        return {
            uniPrisma,
            updatedUsersCount: updatedUsers.count
        };
    });

    return result;
}



export const deleteUni = async (where: Prisma.UniversityWhereUniqueInput) => {
    const uniPrisma = await prisma.university.delete({
        where,
        include: {
            _count: {
                select: { users: true }
            }
        }
    });
    return uniPrisma;
}