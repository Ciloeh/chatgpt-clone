// src/components/BranchViewer.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../Library/supabaseClient';
import { BranchType, MessageType } from '../interfaces/types';
import Message from './Message';

interface BranchViewerProps {
  originalMessageId: string;
}

const BranchViewer: React.FC<BranchViewerProps> = ({ originalMessageId }) => {
  const [branches, setBranches] = useState<BranchType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data: branchesData, error: branchesError } = await supabase
          .from('branches')
          .select('edited_message_id')
          .eq('original_message_id', originalMessageId);

        if (branchesError) throw branchesError;

        setBranches(branchesData as BranchType[]);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Error fetching branches: ${err.message}`);
        } else {
          setError('Unknown error occurred while fetching branches');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [originalMessageId]);

  useEffect(() => {
    if (branches.length > 0) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const messageIds = branches.map(branch => branch.edited_message_id).filter(id => id !== null && id !== undefined);
          if (messageIds.length > 0) {
            const { data: messagesData, error: messagesError } = await supabase
              .from('messages')
              .select('*')
              .in('id', messageIds);

            if (messagesError) throw messagesError;

            setMessages(messagesData as MessageType[]);
          } else {
            setError('No valid message IDs found in branches');
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(`Error fetching messages: ${err.message}`);
          } else {
            setError('Unknown error occurred while fetching messages');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchMessages();
    }
  }, [branches]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="branch-viewer">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

export default BranchViewer;
