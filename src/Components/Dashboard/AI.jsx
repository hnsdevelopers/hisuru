import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Zap, 
  DollarSign,
  Users,
  Target,
  Brain,
  Copy,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  BarChart,
  Lightbulb,
  RefreshCw,
  Settings,
  Key,
  Image as ImageIcon,
  Code,
  FileText,
  Shield,
  Rocket
} from 'lucide-react';

export default function AIAssistant() {
  // State management
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your HiSuru AI Assistant. I can help you analyze productivity data, suggest improvements, and answer questions about your workflow. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'welcome'
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('pollinations_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai'); // openai, gemini, gemini-large, flux
  const [conversationHistory, setConversationHistory] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Available models
  const availableModels = [
    { id: 'openai', name: 'OpenAI GPT', icon: '🤖', description: 'General purpose chat' },
    { id: 'gemini', name: 'Google Gemini', icon: '🌐', description: 'Code execution enabled' },
    { id: 'gemini-large', name: 'Gemini Large', icon: '🚀', description: 'Advanced reasoning' },
    { id: 'flux', name: 'Flux', icon: '🎨', description: 'Image generation' },
    { id: 'gemini-search', name: 'Gemini Search', icon: '🔍', description: 'Web search enabled' }
  ];

  // Quick prompts for productivity
  const quickPrompts = [
    {
      text: "Analyze my weekly productivity",
      icon: BarChart,
      color: "blue"
    },
    {
      text: "Suggest cost-cutting strategies",
      icon: DollarSign,
      color: "green"
    },
    {
      text: "Improve team collaboration",
      icon: Users,
      color: "purple"
    },
    {
      text: "Automate repetitive tasks",
      icon: Sparkles,
      color: "orange"
    }
  ];

  // Enhanced regex patterns for text formatting
  const formattingRegex = {
    headers: /^(#{1,3})\s+(.+)$/gm,
    bold: /\*\*(.*?)\*\*/g,
    italic: /\*(.*?)\*/g,
    unorderedList: /^[\-\*\+]\s+(.+)$/gm,
    orderedList: /^\d+\.\s+(.+)$/gm,
    codeBlock: /```([\s\S]*?)```/g,
    inlineCode: /`([^`]+)`/g,
    links: /\[([^\]]+)\]\(([^)]+)\)/g,
    blockquotes: /^>\s+(.+)$/gm,
    taskList: /^[\-\*\+]\s+\[([ x])\]\s+(.+)$/gm,
    horizontalRule: /^\*\*\*$|^---$|^___$/gm,
    mentions: /@(\w+)/g,
    hashtags: /#(\w+)/g,
    formattedNumbers: /\b(\d+(?:\.\d+)?[kKmMbB%]?)\b/g,
    imageMarkdown: /!\[([^\]]*)\]\(([^)]+)\)/g
  };

  // Format text with regex patterns
  const formatText = (text) => {
    if (!text) return '';
    
    let formatted = text;
    
    // Headers
    formatted = formatted.replace(formattingRegex.headers, (match, hashes, content) => {
      const level = hashes.length;
      const classes = {
        1: 'text-2xl font-bold mt-6 mb-4 border-b pb-2',
        2: 'text-xl font-semibold mt-5 mb-3',
        3: 'text-lg font-medium mt-4 mb-2'
      };
      return `<h${level} class="${classes[level]}">${content}</h${level}>`;
    });
    
    // Bold and Italic
    formatted = formatted.replace(formattingRegex.bold, '<strong class="font-bold text-gray-900">$1</strong>');
    formatted = formatted.replace(formattingRegex.italic, '<em class="italic">$1</em>');
    
    // Lists
    formatted = formatted.replace(formattingRegex.unorderedList, '<li class="ml-6 list-disc">$1</li>');
    formatted = formatted.replace(formattingRegex.orderedList, '<li class="ml-6 list-decimal">$1</li>');
    
    // Wrap lists
    formatted = formatted.replace(/(<li class="ml-6 list-disc">[\s\S]*?<\/li>)/g, (match) => {
      return `<ul class="space-y-2 my-4">${match}</ul>`;
    });
    
    formatted = formatted.replace(/(<li class="ml-6 list-decimal">[\s\S]*?<\/li>)/g, (match) => {
      return `<ol class="space-y-2 my-4">${match}</ol>`;
    });
    
    // Code blocks
    formatted = formatted.replace(formattingRegex.codeBlock, (match, code) => {
      const language = code.split('\n')[0].match(/^\w+/)?.[0] || '';
      const codeContent = code.replace(/^\w+\n/, '');
      return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${language}">${codeContent}</code></pre>`;
    });
    
    // Inline code
    formatted = formatted.replace(formattingRegex.inlineCode, '<code class="bg-gray-800 text-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');
    
    // Links
    formatted = formatted.replace(formattingRegex.links, '<a href="$2" class="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Blockquotes
    formatted = formatted.replace(formattingRegex.blockquotes, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 bg-blue-50 py-2 rounded-r">$1</blockquote>');
    
    // Task lists
    formatted = formatted.replace(formattingRegex.taskList, (match, checked, content) => {
      const isChecked = checked === 'x';
      return `<div class="flex items-center space-x-2 my-2"><input type="checkbox" ${isChecked ? 'checked' : ''} class="w-4 h-4 text-blue-600" disabled><span>${content}</span></div>`;
    });
    
    // Horizontal rules
    formatted = formatted.replace(formattingRegex.horizontalRule, '<hr class="my-6 border-gray-300">');
    
    // Mentions and Hashtags
    formatted = formatted.replace(formattingRegex.mentions, '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">@$1</span>');
    formatted = formatted.replace(formattingRegex.hashtags, '<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-medium">#$1</span>');
    
    // Formatted numbers
    formatted = formatted.replace(formattingRegex.formattedNumbers, (match) => {
      if (match.includes('%')) {
        return `<span class="font-bold text-green-600">${match}</span>`;
      } else if (/[kKmMbB]$/.test(match)) {
        return `<span class="font-bold text-blue-600">${match}</span>`;
      }
      return `<span class="font-bold">${match}</span>`;
    });
    
    // Image markdown
    formatted = formatted.replace(formattingRegex.imageMarkdown, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />');
    
    // Convert newlines
    formatted = formatted.replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">');
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Wrap in paragraph if needed
    if (!formatted.startsWith('<')) {
      formatted = `<p class="mb-4 leading-relaxed">${formatted}</p>`;
    }
    
    return formatted;
  };

  // Save API key to localStorage
  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('pollinations_api_key', 'pk_tu8F4Zx6qtZNFnzW');
    setShowApiKeyInput(false);
  };

  // Remove API key
  const removeApiKey = () => {
    setApiKey('');
    localStorage.removeItem('pollinations_api_key');
  };

  // Call Pollinations.ai API with updated endpoint
  const callPollinationsAPI = async (prompt) => {
    if (!apiKey) {
      throw new Error('API key required. Please add your Pollinations.ai API key.');
    }

    try {
      const apiUrl = 'https://gen.pollinations.ai/v1/chat/completions';
      
      // Prepare messages with conversation history
      const messagesPayload = [
        {
          role: "system",
          content: "You are a productivity and business optimization AI assistant for HiSuru platform. Provide specific, actionable advice for improving efficiency, reducing costs, and optimizing workflows. Format responses with markdown for better readability."
        },
        ...conversationHistory.slice(-5), // Last 5 messages for context
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messagesPayload,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from API');
      }
      
    } catch (error) {
      console.error('Pollinations API error:', error);
      throw error;
    }
  };

  // Generate image with Flux model
  const generateImage = async (prompt) => {
    if (!apiKey) {
      throw new Error('API key required for image generation');
    }

    try {
      const apiUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
      
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Add to conversation history
      const newHistory = [
        ...conversationHistory,
        { role: "user", content: inputText }
      ];
      setConversationHistory(newHistory);

      let response;
      let imageUrl = null;

      // Check if user wants an image
      if (inputText.toLowerCase().includes('generate image') || 
          inputText.toLowerCase().includes('create image') ||
          selectedModel === 'flux') {
        
        imageUrl = await generateImage(inputText);
        response = `I've generated an image based on your request:\n\n![Generated Image](${imageUrl})\n\n**Image Description:** ${inputText}`;
      
      } else {
        // Regular text response
        response = await callPollinationsAPI(inputText);
      }

      const formattedResponse = formatText(response);

      const aiMessage = {
        id: messages.length + 2,
        text: formattedResponse,
        rawText: response,
        sender: 'ai',
        timestamp: new Date(),
        type: imageUrl ? 'image' : 'response',
        imageUrl: imageUrl
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation history with AI response
      setConversationHistory([
        ...newHistory,
        { role: "assistant", content: response }
      ]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: `**Error:** ${error.message}<br><br>Please check your API key and try again. You can get a free API key from <a href="https://pollinations.ai" target="_blank" class="text-blue-500 underline">pollinations.ai</a>`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick prompt click
  const handleQuickPrompt = (promptText) => {
    setInputText(promptText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Copy message to clipboard
  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your HiSuru AI Assistant. How can I help you optimize productivity today?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'welcome'
      }
    ]);
    setConversationHistory([]);
  };

  // Auto-scroll to bottom
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Productivity Assistant</h1>
                <p className="text-gray-600">Powered by Pollinations.ai API</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* API Key Status */}
              {apiKey ? (
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Shield className="w-4 h-4 inline mr-1" />
                    API Key Active
                  </div>
                  <button
                    onClick={removeApiKey}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                    title="Remove API Key"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowApiKeyInput(true)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center"
                >
                  <Key className="w-5 h-5 mr-2" />
                  Add API Key
                </button>
              )}
              
              {/* Model Selector */}
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
                >
                  {availableModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.icon} {model.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* API Key Input Modal */}
          {showApiKeyInput && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Key className="w-6 h-6 text-blue-600 mr-3" />
                    Add Pollinations.ai API Key
                  </h3>
                  <button
                    onClick={() => setShowApiKeyInput(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Get your free API key from{' '}
                  <a 
                    href="https://pollinations.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    pollinations.ai
                  </a>
                </p>
                
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key here"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => saveApiKey(apiKey)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save API Key
                  </button>
                  <button
                    onClick={() => setShowApiKeyInput(false)}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt.text)}
                className={`p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group`}
              >
                <div className={`inline-flex p-2 rounded-lg bg-${prompt.color}-100 mb-3`}>
                  <prompt.icon className={`w-5 h-5 text-${prompt.color}-600`} />
                </div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600">
                  {prompt.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-white/20 mr-3">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">AI Chat Assistant</h3>
                      <p className="text-blue-100 text-sm">
                        Model: {availableModels.find(m => m.id === selectedModel)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={clearConversation}
                      className="px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
                    >
                      Clear Chat
                    </button>
                    {selectedModel === 'flux' && (
                      <div className="px-3 py-1.5 bg-purple-500 text-white rounded-lg flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image Mode
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                          : 'bg-gray-50 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {message.sender === 'ai' && (
                            <>
                              <Bot className="w-4 h-4 mr-2 text-purple-600" />
                              <span className="text-xs opacity-75">AI Assistant</span>
                            </>
                          )}
                          {message.sender === 'user' && (
                            <span className="text-xs opacity-75">You</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs opacity-50">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.sender === 'ai' && (
                            <button
                              onClick={() => copyToClipboard(message.rawText || message.text, message.id)}
                              className="opacity-50 hover:opacity-100 transition-opacity"
                              title="Copy to clipboard"
                            >
                              {copiedMessageId === message.id ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {message.type === 'welcome' ? (
                        <div className="text-gray-700">
                          <div className="flex items-center mb-3">
                            <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                            <span className="font-medium">Welcome to your AI Assistant!</span>
                          </div>
                          <p className="mb-3">I can help you with:</p>
                          <ul className="space-y-2 ml-4">
                            <li className="flex items-center">
                              <ChevronRight className="w-4 h-4 text-blue-500 mr-2" />
                              Productivity optimization strategies
                            </li>
                            <li className="flex items-center">
                              <ChevronRight className="w-4 h-4 text-blue-500 mr-2" />
                              Cost reduction and efficiency improvements
                            </li>
                            <li className="flex items-center">
                              <ChevronRight className="w-4 h-4 text-blue-500 mr-2" />
                              Workflow automation suggestions
                            </li>
                            <li className="flex items-center">
                              <ChevronRight className="w-4 h-4 text-blue-500 mr-2" />
                              Team collaboration optimization
                            </li>
                          </ul>
                          {!apiKey && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-yellow-700 text-sm">
                                <strong>Note:</strong> You need a Pollinations.ai API key to use this feature.
                                <button
                                  onClick={() => setShowApiKeyInput(true)}
                                  className="ml-2 text-yellow-700 underline font-medium"
                                >
                                  Add API Key
                                </button>
                              </p>
                            </div>
                          )}
                        </div>
                      ) : message.type === 'image' && message.imageUrl ? (
                        <div>
                          <p className="mb-3">Here's your generated image:</p>
                          <img 
                            src={message.imageUrl} 
                            alt="AI Generated" 
                            className="rounded-lg max-w-full h-auto mb-3"
                          />
                          <a
                            href={message.imageUrl}
                            download="ai-generated-image.png"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Download Image
                          </a>
                        </div>
                      ) : (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: message.text }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-none p-4 max-w-[85%]">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedModel === 'flux' ? 'Generating image...' : 'Thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        selectedModel === 'flux' 
                          ? "Describe the image you want to generate..." 
                          : "Ask about productivity, costs, or workflow optimization..."
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={isLoading}
                      rows="2"
                    />
                    {!apiKey && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
                        <button
                          onClick={() => setShowApiKeyInput(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Add API Key to Chat
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputText.trim() || !apiKey}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                      isLoading || !inputText.trim() || !apiKey
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-3 flex flex-wrap items-center justify-between text-sm text-gray-500">
                  <div>
                    Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Enter</kbd> to send
                    {selectedModel === 'flux' && (
                      <span className="ml-3">
                        <ImageIcon className="w-4 h-4 inline mr-1" />
                        Image generation enabled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={clearConversation}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear chat
                    </button>
                    <span>
                      {conversationHistory.length} messages in history
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Model Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Rocket className="w-6 h-6 text-blue-600 mr-3" />
                AI Models Available
              </h3>
              
              <div className="space-y-3">
                {availableModels.map(model => (
                  <div
                    key={model.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${selectedModel === model.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{model.icon}</span>
                          <span className="font-medium text-gray-900">{model.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                      </div>
                      {selectedModel === model.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Instructions */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Key className="w-5 h-5 text-yellow-400 mr-3" />
                Getting Started
              </h3>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                  <span>Get free API key from <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">pollinations.ai</a></span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                  <span>Click "Add API Key" and paste your key</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                  <span>Choose model and start chatting</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                  <span>Use "Flux" model for image generation</span>
                </li>
              </ol>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-300 text-xs">
                  <strong>Free Tier:</strong> Limited requests per day<br />
                  <strong>Pro Tip:</strong> For productivity analysis, use Gemini models
                </p>
              </div>
            </div>

            {/* Sample Prompts */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-6 h-6 text-yellow-500 mr-3" />
                Try These Prompts
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleQuickPrompt("Analyze my weekly productivity metrics and suggest improvements")}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">📊 Productivity Analysis</div>
                  <p className="text-sm text-gray-600 mt-1">Get detailed insights and recommendations</p>
                </button>
                
                <button
                  onClick={() => handleQuickPrompt("Generate an image of a productive workspace with modern design")}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">🎨 Workspace Design</div>
                  <p className="text-sm text-gray-600 mt-1">Visualize optimal workspace setup</p>
                </button>
                
                <button
                  onClick={() => handleQuickPrompt("Create a weekly schedule template for maximum productivity")}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">📅 Schedule Optimization</div>
                  <p className="text-sm text-gray-600 mt-1">Plan your week efficiently</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}