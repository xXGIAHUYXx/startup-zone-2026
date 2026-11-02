import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, MessageSquare } from 'lucide-react';
import { Button } from './Button';

interface ConsultationChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  relatedRequestId?: string;
  conversationId?: string;
  customerId?: string;
  customerName?: string;
}

export const ConsultationChatModal: React.FC<ConsultationChatModalProps> = ({
  isOpen,
  onClose,
  relatedRequestId,
  conversationId,
  customerId,
  customerName
}) => {
  const { messages, sendMessage } = useApp();
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  // Resolve isolated conversation ID
  const activeConvId = conversationId || (relatedRequestId ? `conv_${relatedRequestId}` : 'conv_default');
  const activeCustomerId = customerId || (relatedRequestId ? `client_${relatedRequestId}` : 'guest');
  const activeCustomerName = customerName || (relatedRequestId ? `Khách hàng (${relatedRequestId})` : 'Khách hàng');

  // Filter messages strictly for this conversation
  const isolatedMessages = messages.filter(m => m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage({
      conversationId: activeConvId,
      customerId: activeCustomerId,
      customerName: activeCustomerName,
      senderRole: 'customer',
      senderName: activeCustomerName,
      content: inputText.trim(),
      relatedRequestId
    });
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Chat Window */}
      <div className="relative w-full max-w-lg bg-[#f5f5f7] rounded-2xl shadow-2xl border border-[#d2d2d7] flex flex-col h-[560px] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Chat Header */}
        <div className="p-4 bg-[#000000] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-semibold">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-heritage text-lg font-semibold leading-tight">
                Tư Vấn Dịch Vụ Gốm Bát Tràng
              </h3>
              <p className="text-xs text-white/70">
                {relatedRequestId ? `Hội thoại cho yêu cầu ${relatedRequestId}` : 'Bộ phận điều phối viên MADE IN VIETNAM LAB'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {isolatedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6e6e73] space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#e8e8ed]/50 flex items-center justify-center text-[#1d1d1f]">
                <MessageSquare size={22} />
              </div>
              <strong className="text-sm font-semibold text-[#1d1d1f]">Chưa có tin nhắn nào trong cuộc trò chuyện này</strong>
              <p className="text-xs text-[#6e6e73] max-w-xs leading-relaxed">
                Gửi câu hỏi hoặc chia sẻ về mong muốn của bạn, điều phối viên sẽ phản hồi sớm nhất có thể.
              </p>
            </div>
          ) : (
            isolatedMessages.map((msg) => {
              const isCustomer = msg.senderRole === 'customer';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-[#86868b] mb-1 px-1">
                    {msg.senderName} • {msg.createdAt}
                  </span>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isCustomer
                        ? 'bg-[#1d1d1f] text-white rounded-br-xs'
                        : 'bg-white text-[#1d1d1f] border border-[#e8e8ed] rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#e8e8ed] flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập nội dung cần tư vấn..."
            className="flex-1 text-xs sm:text-sm p-2.5 rounded-xl border border-[#d2d2d7] focus:outline-none focus:border-[#0071e3]"
          />
          <Button
            variant="terracotta"
            size="md"
            type="submit"
            icon={<Send size={15} />}
            disabled={!inputText.trim()}
            className="text-xs shrink-0"
          >
            Gửi
          </Button>
        </form>

      </div>
    </div>
  );
};
