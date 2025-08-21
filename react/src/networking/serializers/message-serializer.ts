// src/networking/serializers/message-serializer.ts

class MessageSerializer {
    static deSerialize(data: RawMessage) : Message {
      return {
        id: data.id,
        content: data.content,
        dueDate: new Date(data.due_date),
        isComplete: data.is_complete,
      };
    }
  }
  
  export { MessageSerializer };