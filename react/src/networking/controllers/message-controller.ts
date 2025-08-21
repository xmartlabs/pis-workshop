// src/networking/controllers/message-controller.ts

import { MessageSerializer } from 'networking/serializers/message-serializer';
import { ApiService } from 'networking/api-service';
import { API_ROUTES } from 'networking/api-routes';

class MessageController {
  static async getMessages() : Promise<Message[]> {
    const response = await ApiService.get<RawMessage[]>(API_ROUTES.MESSAGES);
    return response.map((message) => MessageSerializer.deSerialize(message));
  }

  static async createMessage(message: Message): Promise<Message> {
    const response = await ApiService.post<RawMessage>(API_ROUTES.MESSAGES, {
      body: JSON.stringify({
        content: message.content,
        due_date: new Date(message.dueDate),
        is_complete: message.isComplete,
      }),
    });
  
    if (response) {
      return MessageSerializer.deSerialize(response);
    }
    return {} as Message;
  }
}

export { MessageController };