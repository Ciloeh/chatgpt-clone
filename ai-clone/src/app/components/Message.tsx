// src/components/Message.tsx
"use client";

import { useState, useEffect } from 'react';
import MessageEditor from './MessageEditor';
import BranchViewer from './BranchViewer';
import { supabase } from '../Library/supabaseClient';
import { MessageType, BranchType } from '../interfaces/types';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [updatedMessage, setUpdatedMessage] = useState<MessageType>(message); // Add state for updated message

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('edited_message_id')
        .eq('original_message_id', message.id);

      if (error) {
        console.error(error);
      } else {
        setBranches((data as BranchType[]) ?? []);
      }
    };

    fetchBranches();
  }, [message.id]);

  const handleSave = (newMessage: MessageType) => {
    setUpdatedMessage(newMessage); // Update state with the latest edited message
    setIsEditing(false); // Close the editor
  };

  return (
    <div className="message">
      {isEditing ? (
        <MessageEditor
          messageId={updatedMessage.id}
          currentContent={updatedMessage.content}
          onSave={handleSave} // Pass handleSave function to update state
        />
      ) : (
        <>
          <span>{updatedMessage.content}</span>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </>
      )}
      <BranchViewer originalMessageId={message.id} />
    </div>
  );
};

export default Message;
