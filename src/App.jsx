import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const systemMessage = {
  role: "system",
  content: "Explain things like you're talking to a software professional with 2 years of experience."
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hi, I'm GPT chat (only for Sergey) Ask me any question and I will answer for sure)!",
      sentTime: "just now",
      sender: "ChatGPT",
      direction: "incoming" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      sender: "user",
      direction: "outgoing" 
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);

    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((msg) => ({
      role: msg.sender === "ChatGPT" ? "assistant" : "user",
      content: msg.message
    }));

    const apiRequestBody = {
      model: "gpt-4o-mini",
      messages: [systemMessage, ...apiMessages]
    };
    console.log("API Key:", API_KEY); 

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming" 
          }
        ]);
      }
    } catch (error) {
      console.error("Error with API:", error);
    }

    setIsTyping(false);
  }

  return (
    <div className="App">
      <div className="chat-container">
        <MainContainer>
        <ChatContainer>
  <MessageList 
    scrollBehavior="smooth" 
    typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing..." /> : null}
  >
    {messages.map((msg, i) => (
      <Message key={i} model={{ 
        message: msg.message, 
        sender: msg.sender, 
        direction: msg.direction
      }} />
    ))}
  </MessageList>
  <MessageInput placeholder="Type your message here..." onSend={handleSend} />        
</ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
