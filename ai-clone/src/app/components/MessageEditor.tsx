// src/components/MessageEditor.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../Library/supabaseClient';
import { SupabaseResponse, MessageType } from '../interfaces/types';
import { callGPT3 } from '../utils/gpt3'; // Import the GPT-3 utility function

interface MessageEditorProps {
  messageId: string;
  currentContent: string;
  onSave: (updatedMessage: MessageType) => void; // Pass the updated message to the onSave function
  onCancel: () => void; // onCancel prop
}

const MessageEditor: React.FC<MessageEditorProps> = ({ messageId, currentContent, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(currentContent);

  const handleSave = async () => {
    // Update the existing message with the edited content
    const { data: updatedMessageData, error: updatedMessageError }: SupabaseResponse<MessageType> = await supabase
      .from('messages')
      .update({ content: editedContent })
      .eq('id', messageId)
      .select('*')
      .single();

    if (updatedMessageError) {
      console.error(updatedMessageError);
      return;
    }

    if (updatedMessageData) {
      onSave(updatedMessageData); // Pass the updated message back to the parent component
    }
  };

  return (
    <div className="m-auto text-base py-[18px] px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5">
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <div className="group/conversation-turn relative flex w-full min-w-0 flex-col">
          <div className="flex-col gap-1 md:gap-3">
            <div className="flex max-w-full flex-col flex-grow">
              <div className="rounded-3xl bg-token-main-surface-tertiary px-3 py-3">
                <div className="m-2 max-h-[25dvh] overflow-auto">
                  <div className="grid">
                    <textarea
                      className="CancealOutline col-start-1 col-end-2 row-start-1 row-end-2 resize-none overflow-hidden p-0 m-0 w-full border-0 bg-transparent focus:ring-0 focus-visible:ring-0"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    ></textarea>
                    <span className="invisible col-start-1 col-end-2 row-start-1 row-end-2 whitespace-pre-wrap p-0">
                      what is chemistry?
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button className="btn relative btn-secondary" onClick={onCancel}>
                    <div className="flex items-center justify-center">Cancel</div>
                  </button>
                  <button className="btn relative btn-primary" onClick={handleSave}>
                    <div className="flex items-center justify-center">Send</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageEditor;
