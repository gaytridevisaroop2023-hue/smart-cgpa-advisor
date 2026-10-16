import React, { useState, useRef, useEffect } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  generateAdvisorResponse,
  INITIAL_ADVISOR_MESSAGES,
  ADVISOR_DISCLAIMER,
} from '../utils/advisorLogic';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function AcademicAdvisorChat() {
  const {
    student,
    semesters,
    stats,
    targetPlan,
    prioritySubjects,
  } = useAcademic();

  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('advisor_chat_history');
    return saved ? JSON.parse(saved) : INITIAL_ADVISOR_MESSAGES;
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('advisor_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Context snapshot for generator
    const context = {
      student,
      semesters,
      stats,
      targetPlan,
      prioritySubjects,
    };

    setTimeout(() => {
      const responseText = generateAdvisorResponse(query, context);
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'advisor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: responseText,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_ADVISOR_MESSAGES);
    sessionStorage.removeItem('advisor_chat_history');
  };

  // Helper to render basic markdown format (headers, bold, bullets)
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="advisor-chat-h4">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={idx} className="advisor-chat-h5">{line.replace('#### ', '')}</h5>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <div key={idx} className="advisor-bullet-item">
            <span className="bullet-dot">•</span>
            <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(line.slice(2)) }} />
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="advisor-number-item">
            <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }} />
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="advisor-space" />;
      }
      return (
        <p
          key={idx}
          className="advisor-chat-p"
          dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }}
        />
      );
    });
  };

  const parseInlineStyles = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code class="chat-code">$1</code>');
  };

  const SUGGESTIONS = [
    'My CGPA is 2.8 and I want 3.2. What should I focus on?',
    'Which subjects should I focus on first?',
    'Can I still graduate with honors (3.5+)?',
    'What GPA do I need next semester?',
    'Explain how credit hours impact my CGPA calculation',
  ];

  return (
    <div className="section-container advisor-page-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <div className="flex-center gap-2">
            <h2 className="section-title">Smart Academic Advisor</h2>
            <span className="badge-highlight">
              <Sparkles size={13} /> Live Context
            </span>
          </div>
          <p className="section-subtitle">
            Ask strategic questions about reaching target GPAs, prioritizing course recovery, and maximizing degree standing.
          </p>
        </div>

        <div className="section-actions-row">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClearChat}
            title="Reset conversation"
          >
            <RotateCcw size={14} /> Clear Chat
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="advisor-disclaimer-box">
        <ShieldAlert size={16} className="text-warning flex-shrink-0" />
        <span>
          <strong>Academic Advisory Disclaimer:</strong> {ADVISOR_DISCLAIMER}
        </span>
      </div>

      {/* Chat Interface Box */}
      <div className="advisor-chat-window">
        {/* Messages Feed */}
        <div className="chat-messages-scroll">
          {messages.map((msg) => {
            const isBot = msg.sender === 'advisor';

            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isBot ? 'msg-advisor' : 'msg-user'}`}
              >
                <div className="chat-avatar">
                  {isBot ? (
                    <BotMessageSquare size={18} className="text-primary" />
                  ) : (
                    <User size={18} className="text-accent" />
                  )}
                </div>

                <div className="chat-bubble">
                  <div className="chat-bubble-header">
                    <span className="chat-sender-name">
                      {isBot ? 'Advisor Alex (Smart CGPA Bot)' : student.name}
                    </span>
                    <span className="chat-time">{msg.timestamp}</span>
                  </div>

                  <div className="chat-bubble-body">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Optional Quick Reply Chips for Welcome Message */}
                  {msg.quickReplies && (
                    <div className="quick-replies-wrap">
                      <span className="quick-lbl">Recommended questions:</span>
                      <div className="quick-chips">
                        {msg.quickReplies.map((qr, i) => (
                          <button
                            key={i}
                            className="btn-quick-chip"
                            onClick={() => handleSendMessage(qr)}
                          >
                            <span>{qr}</span>
                            <ArrowRight size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="chat-message-row msg-advisor">
              <div className="chat-avatar">
                <BotMessageSquare size={18} className="text-primary" />
              </div>
              <div className="chat-bubble typing-bubble">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="text-muted text-xs">Advisor Alex is calculating...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills Bar */}
        <div className="advisor-prompts-bar">
          <span className="prompts-title">Try asking:</span>
          <div className="prompts-scroll">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                className="prompt-pill"
                onClick={() => handleSendMessage(sug)}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="chat-text-input"
            placeholder="Type your academic advising question (e.g. 'My CGPA is 2.8 and I want 3.2. What should I focus on?')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-send"
            disabled={!inputText.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
