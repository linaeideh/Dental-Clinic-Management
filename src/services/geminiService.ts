import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Helper to safely access env vars in both Vite and Node environments
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key] || import.meta.env[`VITE_${key}`];
  }
  return '';
};

// Initialize Gemini Client
const getClient = () => {
  const apiKey = getEnv('API_KEY'); 
  return new GoogleGenAI({ apiKey });
};

export const analyzeDentalImage = async (base64Image: string): Promise<string> => {
  const ai = getClient();
  
  if (!base64Image) return "خطأ: لم يتم تقديم صورة.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `أنت مساعد طبيب أسنان ذكي. قم بتحليل هذه الصورة للأسنان أو اللثة.
            1. حدد أي مشاكل ظاهرة (مثل تسوس، التهاب لثة، جير، تصبغات، أو عدم انتظام).
            2. اقترح إجراءً طبياً محتملاً (مثل تنظيف، حشو، تقويم).
            3. قدم نصيحة منزلية سريعة.
            
            هام جداً: ابدأ إجابتك بعبارة إخلاء مسؤولية واضحة بأن هذا ليس تشخيصاً طبياً نهائياً ويجب زيارة الطبيب.
            اجعل الإجابة موجزة وباللغة العربية.`
          },
        ],
      },
    });

    return response.text || "لم أتمكن من تحليل الصورة. يرجى المحاولة مرة أخرى بصورة أوضح.";
  } catch (error) {
    console.error("Gemini Analysis Error (Using Mock):", error);
    // Mock Response
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
    return `⚠️ تنبيه: هذا تحليل افتراضي (لأن الخدمة غير متصلة).
    
    بناءً على الصورة (محاكاة):
    1. المشاكل الظاهرة: يبدو أن هناك تصبغات سطحية وربما بداية جير بين الأسنان السفلية. اللثة تبدو وردية صحية بشكل عام.
    2. الإجراء المقترح: جلسة تنظيف أسنان وتلميع لإزالة الرواسب.
    3. نصيحة منزلية: استخدم خيط الأسنان يومياً قبل النوم، وفرشاة ناعمة.
    
    * هذا مجرد مثال للتوضيح ولا يمثل تحليلاً للصورة المرفقة فعلياً.`;
  }
};

export const chatWithAI = async (message: string, history: {role: 'user' | 'model', text: string}[]): Promise<string> => {
    const ai = getClient();
    
    const context = history.map(h => `${h.role === 'user' ? 'المريض' : 'المساعد'}: ${h.text}`).join('\n');
    const prompt = `
    أنت مساعد افتراضي لعيادة أسنان.
    السياق السابق:
    ${context}
    
    سؤال المريض الحالي: ${message}
    
    أجب بلطف واحترافية. قدم معلومات دقيقة عن إجراءات الأسنان الشائعة، وحث المستخدم على حجز موعد إذا كانت الحالة تتطلب ذلك.
    لا تقدم وصفات طبية للأدوية.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "عذراً، لم أفهم السؤال.";
    } catch (error) {
        console.error("Gemini Chat Error (Using Mock):", error);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return "أهلاً بك! بما أنني غير متصل بالإنترنت حالياً بشكل كامل، لا يمكنني معالجة سؤالك بدقة. لكن بشكل عام، ننصحك دائماً بزيارة العيادة للفحص الدوري. يمكنك حجز موعد من الصفحة الرئيسية!";
    }
}