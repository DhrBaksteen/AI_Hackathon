export interface Message {
    content: string;
    isUser: boolean;
    timestamp: number;
}

export interface ChatHistory {
    userId: string;
    messages: Message[];
}

export interface ChatState {
    [userId: string]: Message[];
} 