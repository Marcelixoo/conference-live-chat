import { Request, Response } from "express";
import { CreateMessageService } from "../services/CreateMessageService";

class CreateMessageController {
    async handle(request: Request, response: Response) {
        const { message } = request.body;
        const { user_id } = request;

        if (!message) {
            return response.status(400).json({
                error: {
                    "message": "Required property of type string."
                }
            });
        }

        try {
            const service = new CreateMessageService();
            const result = await service.execute(message, user_id);
            return response.json(result);
        } catch (err) {
            response.status(401).json({ error: err });
        }
    }
}

export { CreateMessageController }