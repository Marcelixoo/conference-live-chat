import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";

class AuthenticateUserController {
    async handle(request: Request, response: Response) {
        const service = new AuthenticateUserService();
        const { code } = request.body;

        try {
            const result = await service.execute(code);
            return response.json(result);
        } catch (err) {
            response.status(401).json({ error: err });
        }
    }
}

export { AuthenticateUserController }