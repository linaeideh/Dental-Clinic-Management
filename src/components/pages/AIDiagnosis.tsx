'use client'

import React, { useState, useRef } from 'react';
import { analyzeDentalImage, chatWithAI } from '@/services/geminiService';
import { Camera, Send, Image as ImageIcon, Loader2, Sparkles, MessageSquare } from 'lucide-react';

const AIDiagnosis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'chat'>('image');
  
  // Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: 'مرحباً! أنا المساعد الذكي للعيادة. كيف يمكنني مساعدتك اليوم بخصوص صحة أسنانك؟' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Image Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(''); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!selectedImage) return;
    setLoadingAnalysis(true);
    // Extract base64 part only
    const base64Data = selectedImage.split(',')[1];
    const result = await analyzeDentalImage(base64Data);
    setAnalysisResult(result);
    setLoadingAnalysis(false);
  };

  // Chat Handlers
  const handleSendMessage = async () => {
      if (!inputMessage.trim()) return;
      
      const newHistory = [...messages, { role: 'user' as const, text: inputMessage }];
      setMessages(newHistory);
      setInputMessage('');
      setLoadingChat(true);

      const response = await chatWithAI(inputMessage, messages);
      
      setMessages([...newHistory, { role: 'model' as const, text: response }]);
      setLoadingChat(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
              <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المساعد الذكي للأسنان</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
              استخدم أحدث تقنيات الذكاء الاصطناعي للحصول على تحليل أولي لصور أسنانك أو الدردشة للحصول على استشارات سريعة.
          </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="bg-gray-50 md:w-64 border-l border-gray-200 flex flex-row md:flex-col">
              <button 
                onClick={() => setActiveTab('image')}
                className={`flex-1 md:flex-none p-4 text-right font-medium flex items-center gap-3 hover:bg-gray-100 transition ${activeTab === 'image' ? 'bg-white border-r-4 border-purple-500 text-purple-700' : 'text-gray-600'}`}
              >
                  <Camera size={20} />
                  تحليل الصور
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 md:flex-none p-4 text-right font-medium flex items-center gap-3 hover:bg-gray-100 transition ${activeTab === 'chat' ? 'bg-white border-r-4 border-indigo-500 text-indigo-700' : 'text-gray-600'}`}
              >
                  <MessageSquare size={20} />
                  محادثة فورية
              </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-8 bg-gray-50/50">
              
              {/* IMAGE ANALYSIS TAB */}
              {activeTab === 'image' && (
                  <div className="h-full flex flex-col">
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white p-6 relative">
                          {selectedImage ? (
                              <div className="relative w-full max-h-[400px] overflow-hidden rounded-lg">
                                  <img src={selectedImage} alt="Upload" className="object-contain w-full h-full mx-auto" />
                                  <button 
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                  >
                                      ✕
                                  </button>
                              </div>
                          ) : (
                              <div className="text-center py-12">
                                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                  <p className="text-gray-600 mb-4">قم برفع صورة واضحة للسن أو اللثة</p>
                                  <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                                  >
                                      اختر صورة
                                  </button>
                              </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                          />
                      </div>

                      {selectedImage && !analysisResult && (
                          <div className="mt-6 text-center">
                              <button 
                                onClick={runAnalysis}
                                disabled={loadingAnalysis}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition disabled:opacity-70 flex items-center justify-center gap-2 mx-auto"
                              >
                                  {loadingAnalysis ? (
                                      <><Loader2 className="animate-spin" /> جاري التحليل...</>
                                  ) : (
                                      <><Sparkles size={18} /> تحليل الصورة</>
                                  )}
                              </button>
                          </div>
                      )}

                      {analysisResult && (
                          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-purple-100 animate-fade-in">
                              <h3 className="font-bold text-lg text-gray-800 mb-2">نتيجة التحليل:</h3>
                              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                                  {analysisResult}
                              </div>
                              <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                                  * هذا التحليل بواسطة الذكاء الاصطناعي ولا يغني عن زيارة الطبيب المختص.
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                  <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
                          {messages.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                                      msg.role === 'user' 
                                      ? 'bg-indigo-100 text-indigo-900 rounded-br-none' 
                                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                  }`}>
                                      {msg.text}
                                  </div>
                              </div>
                          ))}
                          {loadingChat && (
                              <div className="flex justify-end">
                                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                                      <div className="flex gap-1">
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                      <div className="p-4 border-t bg-gray-50 flex gap-2">
                          <input 
                            type="text" 
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="اكتب سؤالك هنا..."
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <button 
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || loadingChat}
                            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-gray-300 transition"
                          >
                              <Send size={20} className={loadingChat ? 'opacity-0' : 'opacity-100'} />
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default AIDiagnosis;