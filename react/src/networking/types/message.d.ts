// src/networking/types/message.d.ts

type RawMessage = {
    id: number,
    content: string,
    due_date: string,
    is_complete: boolean,
  };
  
  type Message = {
    id: number,
    content: string,
    dueDate: Date,
    isComplete: boolean,
  };