import { useState, useEffect } from 'react';
import { supabase } from '../Library/supabaseClient';
import { MessageType, BranchType } from '../interfaces/types';
import Message from './Message';
import MessageEditor from './MessageEditor';
import { parseISO, format, isValid } from 'date-fns';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [branches, setBranches] = useState<BranchType[]>([]); // Add state for branches

  // Group messages by group ID
  const groupMessagesByGroupId = (messages: MessageType[]) => {
    return messages.reduce((group, message) => {
      const groupId = message.group_id || message.id;
      if (!group[groupId]) {
        group[groupId] = [];
      }
      group[groupId].push(message);
      return group;
    }, {} as { [key: string]: MessageType[] });
  };

  // Truncate content
  const truncateContent = (content: string, length: number = 50) => {
    return content.length > length ? content.slice(0, length) + '...' : content;
  };

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch all messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase.from('messages').select('*');
      if (error) {
        console.error(error);
      } else {
        setMessages(data ? (data as MessageType[]) : []);
      }
    };

    fetchMessages();
  }, []);

  // Fetch all branches on component mount
  useEffect(() => {
    const fetchAllBranches = async () => {
      const { data, error } = await supabase.from('branches').select('*');
      if (error) {
        console.error(error);
      } else {
        setBranches(data ? (data as BranchType[]) : []);
      }
    };

    fetchAllBranches();
  }, []);

  // Create a new group
  const createNewGroup = async () => {
    const { data, error } = await supabase.from('groups').insert({}).select();
    if (error) {
      console.error(error);
      return null;
    }
    return data[0].id; // Return the new group ID
  };

  // Create a new branch
  const createBranch = async (originalMessageId: string) => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert([{ original_message_id: originalMessageId }])
        .select();

      if (error) {
        console.error('Error creating branch:', error);
        return null;
      }

      return data[0].id; // Return the new branch ID
    } catch (error) {
      console.error('Error creating branch:', error);
      return null;
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      let groupId = selectedGroupId;
      if (!groupId) {
        groupId = await createNewGroup(); // Create a new group if none selected
      }

      const created_at = new Date().toISOString();
      const { data, error } = await supabase.from('messages').insert([{ content: newMessage, role: 'user', created_at, group_id: groupId }]).select();
      if (error) {
        console.error(error);
      } else {
        const newMessages = data ? (data as MessageType[]) : [];
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        setNewMessage('');

        if (newMessages.length > 0) {
          const createdDate = parseISO(newMessages[0].created_at);
          setSelectedMessageId(newMessages[0].id);
          setSelectedDate(isValid(createdDate) ? format(createdDate, 'yyyy-MM-dd') : 'Invalid date');
          setSelectedGroupId(newMessages[0].group_id || null); // Ensure valid type
        }

        const chatHistory = [...messages, { role: 'user', content: newMessage, created_at, group_id: groupId }];
        const gpt3Response = await callGPT3(chatHistory);

        const responseMessage = gpt3Response;
        const { data: gptData, error: gptError } = await supabase.from('messages').insert([{ content: responseMessage, role: 'assistant', created_at: new Date().toISOString(), group_id: groupId }]).select();
        if (gptError) {
          console.error(gptError);
        } else {
          setMessages((prevMessages) => [...prevMessages, ...(gptData as MessageType[])]);
        }
      }
    }
  };

  // Handle creating a new group
  const handleNewGroup = () => {
    setSelectedGroupId(null);
    setSelectedMessageId(null);
    setSelectedDate(null);
  };

  // Handle editing a message
  const handleEditMessage = async (message: MessageType, newContent: string) => {
    const branchId = await createBranch(message.id);
    if (!branchId) {
      console.error('Failed to create branch');
      return;
    }

    const created_at = new Date().toISOString();
    const { data, error } = await supabase.from('messages').insert([{ content: newContent, role: 'user', created_at, parent_message_id: message.id, branch_id: branchId }]).select();
    if (error) {
      console.error('Error inserting edited message:', error);
    } else {
      const newMessages = data ? (data as MessageType[]) : [];
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      setEditingMessageId(null);
    }
  };

  // Handle saving an edited message
  const handleSaveEditedMessage = (updatedMessage: MessageType) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
    );
    setEditingMessageId(null);
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  // Handle clicking on a date
  const handleDateClick = (date: string) => {
    setSelectedDate((prevDate) => (prevDate === date ? null : date));
  };

  // Handle clicking on a group
  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId); // Set selectedGroupId to the clicked group ID
  };

  // Handle clicking on a message
  const handleMessageClick = (messageId: string) => {
    setSelectedMessageId(messageId); // Set selectedMessageId to the clicked message ID
  };

  const groupedMessages = groupMessagesByGroupId(messages);

  if (!isClient) {
    return <div>Loading...</div>; // Temporary loading state until client-side rendering
  }

  return (
    <div>
      <div>
        {Object.entries(groupedMessages).map(([groupId, messages]) => {
          const firstUserMessage = messages.find((message) => message.role === 'user');
          const groupDate = parseISO(groupId);
          return (
            <div key={groupId}>
              <div className="sticky bg-token-sidebar-surface-primary top-0 z-20 cursor-pointer" onClick={() => handleGroupClick(groupId)}>
                <span className="flex h-9 items-center">
                  <h3 className="px-2 text-xs font-semibold text-ellipsis overflow-hidden break-all pt-3 pb-2 text-token-text-primary">
                    {isValid(groupDate) ? format(groupDate, 'MMMM d, yyyy') : ''}
                  </h3>
                </span>
              </div>
              <ol>
                {firstUserMessage && (
                  <li key={firstUserMessage.id} className="relative z-[15]" onClick={() => handleMessageClick(firstUserMessage.id)}>
                    <div className="no-draggable message-item-b group-hover:bg-gray-300 group hover:bg-gray-200 hover:cursor-pointer rounded-lg active:opacity-90 bg-[var(--item-background-color)] h-9 text-sm relative transition-colors">
                      <a className="flex items-center gap-2 p-2">
                        <div className="relative grow overflow-hidden whitespace-nowrap" dir="auto" title={firstUserMessage.content}>
                          {truncateContent(firstUserMessage.content)}
                          <div className="absolute bottom-0 top-0 from-[var(--item-background-color)] to-transparent ltr:right-0 ltr:bg-gradient-to-l rtl-left-0 rtl:bg-gradient-to-r w-8 from-0% can-hover:group-hover:w-10 can-hover