import { prismaClient } from "../prisma";

class UserProfileService {
    async execute(user_id: string) {
        const profile = await prismaClient.user.findFirst({
            where: {
                id: user_id
            },
            include: {
                messages: true
            }
        });

        return profile;
    }
}

export { UserProfileService }