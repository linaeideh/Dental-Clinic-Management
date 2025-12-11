import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini Client
// WARNING: In a production Next.js app, this should be a Server Action or API Route.
// Since this is a client-side demo, we use the env variable directly.
const getClient = () => {
  const apiKey = process.env.API_KEY || ''; 
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
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity in this demo
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
    console.error("Gemini Analysis Error:", error);
    return "حدث خطأ أثناء الاتصال بالمساعد الذكي. تأكد من مفتاح API.";
  }
};

export const chatWithAI = async (message: string, history: {role: 'user' | 'model', text: string}[]): Promise<string> => {
    const ai = getClient();
    
    // Formatting history for context (simplified context window)
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
        console.error("Gemini Chat Error:", error);
        return "واجهت مشكلة في الاتصال. يرجى المحاولة لاحقاً.";
    }
}