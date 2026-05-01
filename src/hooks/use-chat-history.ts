'use client';

import {useState, useEffect, useCallback, useRef} from 'react';
import {type Chat, type Message} from '@/lib/types';
import {useAuth} from './use-auth';
import {
  isIDBAvailable,
  idbGetChats,
  idbPutChat,
  idbDeleteChat,
  idbGetMessages,
  idbAddMessage,
  idbDeleteAllUserData,
  type DBChat,
  type DBMessage,
} from '@/lib/indexed-db';

function toDBChat(chat: Chat): DBChat {
  return { id: chat.id, userId: chat.userId, title: chat.title, createdAt: chat.createdAt, updatedAt: chat.updatedAt };
}
function fromDBChat(db: DBChat): Chat {
  return { id: db.id, userId: db.userId, title: db.title, createdAt: db.createdAt, updatedAt: db.updatedAt };
}
function toDBMessage(msg: Message, chatId: string, userId: string): DBMessage {
  return { id: msg.id, chatId, userId, role: msg.role, content: msg.content, createdAt: msg.createdAt, modelUsed: msg.modelUsed, autoRouted: msg.autoRouted, imageUrl: msg.imageUrl, imageProvider: msg.imageProvider };
}
function fromDBMessage(db: DBMessage): Message {
  return { id: db.id, role: db.role, content: db.content, createdAt: db.createdAt, modelUsed: db.modelUsed, autoRouted: db.autoRouted, imageUrl: db.imageUrl, imageProvider: db.imageProvider };
}

function isLegacyWelcomeMessage(message: Message): boolean {
  return message.role === 'assistant' && message.content.trim() === 'How can I help you today?';
}

export function useChatHistory() {
  const {user} = useAuth();
  const userId = user?.uid;

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedChatIds = useRef<Set<string>>(new Set());

  // Load chats from IndexedDB on mount / user change
  useEffect(() => {
    if (!isIDBAvailable() || !userId) {
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    loadedChatIds.current.clear();

    idbGetChats(userId).then(async (dbChats) => {
      const loaded = dbChats.map(fromDBChat);
      setChats(loaded);
      if (loaded.length > 0) {
        const recent = loaded[0];
        setActiveChatId(recent.id);
        const dbMsgs = await idbGetMessages(recent.id);
        loadedChatIds.current.add(recent.id);
        setMessages({ [recent.id]: dbMsgs.map(fromDBMessage).filter(msg => !isLegacyWelcomeMessage(msg)) });
      }
      setIsLoaded(true);
    }).catch((err) => {
      console.warn('[useChatHistory] load failed:', err);
      setIsLoaded(true);
    });
  }, [userId]);

  // Load messages for active chat when it changes
  useEffect(() => {
    if (!activeChatId || !isIDBAvailable() || loadedChatIds.current.has(activeChatId)) return;
    idbGetMessages(activeChatId).then((dbMsgs) => {
      loadedChatIds.current.add(activeChatId);
      setMessages(prev => ({ ...prev, [activeChatId]: dbMsgs.map(fromDBMessage).filter(msg => !isLegacyWelcomeMessage(msg)) }));
    }).catch(console.warn);
  }, [activeChatId]);

  // Auto-create first chat if none exist after load
  useEffect(() => {
    if (!isLoaded) return;
    if (chats.length === 0) {
      createNewChat();
    } else if (!activeChatId || !chats.some(c => c.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const createNewChat = useCallback(() => {
    const ownerId = userId ?? 'guest';
    const now = new Date().toISOString();
    const newChat: Chat = { id: crypto.randomUUID(), userId: ownerId, title: 'New Chat', createdAt: now, updatedAt: now };

    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({ ...prev, [newChat.id]: [] }));
    setActiveChatId(newChat.id);
    loadedChatIds.current.add(newChat.id);

    if (isIDBAvailable()) {
      idbPutChat(toDBChat(newChat)).catch(console.warn);
    }
  }, [userId]);

  const addMessage = useCallback(
    (chatId: string, message: Omit<Message, 'id' | 'createdAt'>, newTitle?: string) => {
      const ownerId = userId ?? 'guest';
      const now = new Date().toISOString();
      const newMsg: Message = { ...message, id: crypto.randomUUID(), createdAt: now };

      // Optimistic UI update
      setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), newMsg] }));
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, title: newTitle ?? c.title, updatedAt: now } : c
      ));

      // Persist to IndexedDB
      if (isIDBAvailable()) {
        idbAddMessage(toDBMessage(newMsg, chatId, ownerId)).catch(console.warn);
        // Update chat updatedAt
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          idbPutChat(toDBChat({ ...chat, title: newTitle ?? chat.title, updatedAt: now })).catch(console.warn);
        }
      }
    },
    [userId, chats]
  );

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    setMessages(prev => { const copy = {...prev}; delete copy[chatId]; return copy; });
    setActiveChatId(prev => prev === chatId ? '' : prev);
    loadedChatIds.current.delete(chatId);
    if (isIDBAvailable()) idbDeleteChat(chatId).catch(console.warn);
  }, []);

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
    if (isIDBAvailable()) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) idbPutChat(toDBChat({ ...chat, title: newTitle })).catch(console.warn);
    }
  }, [chats]);

  const deleteAllUserChats = useCallback(() => {
    setChats([]);
    setMessages({});
    setActiveChatId('');
    loadedChatIds.current.clear();
    if (isIDBAvailable() && userId) idbDeleteAllUserData(userId).catch(console.warn);
  }, [userId]);

  const exportChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return null;
    return { chat, messages: messages[chatId] || [] };
  }, [chats, messages]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeChatMessages = messages[activeChatId] || [];

  return {
    chats: [...chats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    activeChat,
    activeChatId,
    setActiveChatId,
    activeChatMessages,
    isLoaded,
    createNewChat,
    addMessage,
    deleteChat,
    renameChat,
    deleteAllUserChats,
    exportChat,
  };
}
