import axios from "axios";
import { sign } from "jsonwebtoken";
import { prismaClient } from "../prisma";

interface IAccessTokenResponse {
    access_token: string
}

type UserType = {
    id: string,
    github_id: number,
    login: string,
    name: string
    avatar_url: string,

}

/**
 * Responsible for authenticating users via Github API.
 *
 * Steps:
 *  1. Get the string code from Github API.
 *  2. Recover additional user information via the Github API.
 *  3. Verify if user exists in the database.
 *    3.a If yes, generate a new token.
 *    3.b If not, create a new record and generate token
 *  4. Return token with all other necessary information from user.
 */
class AuthenticateUserService {
    async execute(code: string) {
        const accessToken = await this.getAccessToken(code);
        const userInformation = await this.getUserInformation(accessToken);
        const user = await this.findOrCreateUser(userInformation);
        const token = await this.generateApplicationToken(user);

        return { token, user };
    }

    async getAccessToken(code: string): Promise<string> {
        const url = "https://github.com/login/oauth/access_token";

        const { data: response } = await axios.post<IAccessTokenResponse>(url, null, {
            params: {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            headers: {
                "Accept": "application/json"
            }
        });

        return response.access_token;
    }

    async getUserInformation(accessToken: string): Promise<UserType> {
        const { data: userResponse } = await axios.get<UserType>("https://api.github.com/user", {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });

        return userResponse;
    }

    async findOrCreateUser(userInformation: UserType): Promise<UserType> {
        const user = await prismaClient.user.findFirst({
            where: {
                github_id: userInformation.github_id
            }
        });

        if (!user) {
            return await prismaClient.user.create({
                data: {
                    github_id: userInformation.github_id,
                    login: userInformation.login,
                    avatar_url: userInformation.avatar_url,
                    name: userInformation.name
                }
            })
        }

        return user;
    }

    async generateApplicationToken(user: UserType): Promise<string> {
        const secret = process.env.JWT_SECRET;
        const payload = {
            user: {
                name: user.name,
                avatar_url: user.avatar_url,
                id: user.id
            }
        };
        const signOptions = {
            subject: user.id,
            expiresIn: "1d"
        };

        return sign(payload, secret, signOptions);
    }
}

export { AuthenticateUserService }