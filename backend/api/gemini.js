

// Helper to call Gemini API
async function callGemini(prompt, systemInstruction = "") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("Invalid response format from Gemini API.");
  }
  return textResponse;
}

// Clean JSON response from LLM markdown wrappers
function cleanJsonString(str) {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
}

// 1. AI GRADING WRITING ASSIGNMENTS
export async function aiEvaluateWriting(text, levelGoal) {
  const systemInstruction = "You are an expert English teacher grading writing assignments based on the CEFR scale. You must always return response in strict JSON format containing fields: score (number out of 10), scores (object containing grammar, vocabulary, coherence as numbers out of 10), feedback (string in Vietnamese), and improvedText (string representing the optimized English version of the student's text).";
  
  const prompt = `Grade this student's writing assignment:
  ---
  Text: "${text}"
  Target Level: ${levelGoal}
  ---
  Please grade fairly. Analyze grammatical correctness, lexical variety, spelling, punctuation, and structural coherence.
  Provide constructive feedback in Vietnamese. Recommend spelling corrections, grammar repairs, and better vocabulary alternatives.
  Return only the JSON containing keys: score, scores (with keys: grammar, vocabulary, coherence), feedback, and improvedText.`;

  try {
    const rawResult = await callGemini(prompt, systemInstruction);
    const cleaned = cleanJsonString(rawResult);
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Gemini AI Grading failed, using rule-based fallback:", error.message);
    
    // Rule-based Fallback
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    let score = 5.0;
    let grammar = 5;
    let vocabulary = 5;
    let coherence = 5;

    if (wordCount > 60) {
      score = 7.5;
      grammar = 7;
      vocabulary = 8;
      coherence = 7.5;
    } else if (wordCount > 20) {
      score = 5.5;
      grammar = 5.5;
      vocabulary = 5.5;
      coherence = 5.5;
    } else {
      score = 3.0;
      grammar = 3.0;
      vocabulary = 3.0;
      coherence = 3.0;
    }

    return {
      score,
      scores: { grammar, vocabulary, coherence },
      feedback: `[Dữ liệu Giả lập - API Offline] Bài viết của bạn gồm ${wordCount} từ. Để cải thiện, hãy viết dài hơn, mở rộng vốn từ vựng và chú ý thì của động từ.`,
      improvedText: text
    };
  }
}

// 2. AI GENERATE PROGRESS TEST (5 Quizzes + 1 Writing)
export async function aiGenerateProgressTest(level) {
  const systemInstruction = "You are an English test generator. You must always output responses in a strict JSON object representing a quiz test matching the CEFR level. The JSON must contain: questions (a list of 5 multiple-choice questions, each containing fields: id, question, options as array of 4 strings, answer as the exact correct option string, and explanation as a string in Vietnamese explaining why this answer is correct) and essayPrompt (string).";
  
  const prompt = `Create a custom progress test for a student in the ${level} class.
  The test must include:
  1. 5 multiple-choice grammar and vocabulary questions targeted specifically for ${level} level.
  2. 1 writing essay prompt suited for ${level} level.
  Return only the JSON with keys: questions (array of 5 objects containing: id, question, options, answer, explanation) and essayPrompt (string).`;

  try {
    const rawResult = await callGemini(prompt, systemInstruction);
    const cleaned = cleanJsonString(rawResult);
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Gemini Test Generation failed, using static fallback for level:", level);
    
    // Static Fallback Tests
    if (level === "Basic") {
      return {
        questions: [
          { id: "q1", question: "Which word is a verb?", options: ["Happiness", "Happy", "Happily", "Run"], answer: "Run", explanation: "Từ 'Run' (chạy) chỉ hành động, do đó nó là động từ (verb)." },
          { id: "q2", question: "She ______ to school every day.", options: ["go", "goes", "going", "gone"], answer: "goes", explanation: "Chủ ngữ là 'She' (ngôi thứ ba số ít), câu diễn tả thói quen hàng ngày nên dùng thì hiện tại đơn thêm 'es' thành 'goes'." },
          { id: "q3", question: "Identify the greeting:", options: ["Goodbye", "Hello", "Thank you", "Sorry"], answer: "Hello", explanation: "Từ 'Hello' (xin chào) dùng để chào hỏi lúc gặp mặt." },
          { id: "q4", question: "I ______ a student.", options: ["am", "is", "are", "be"], answer: "am", explanation: "Chủ ngữ là 'I' đi với động từ to be chia ở hiện tại đơn là 'am'." },
          { id: "q5", question: "Choose the correct spelling:", options: ["English", "Englesh", "Inglish", "Englich"], answer: "English", explanation: "'English' (Tiếng Anh/người Anh) là cách viết chính tả đúng chuẩn duy nhất." }
        ],
        essayPrompt: "Write a short paragraph (50-60 words) describing your favorite food and why you like it."
      };
    } else if (level === "Advanced") {
      return {
        questions: [
          { id: "q1", question: "Had we known about the storm, we ______ the trip.", options: ["would cancel", "canceled", "would have canceled", "will cancel"], answer: "would have canceled", explanation: "Đây là câu điều kiện loại 3 đảo ngữ (Had we known...), vế sau phải dùng dạng 'would have + V3/ed'." },
          { id: "q2", question: "Which word is synonymous with 'indispensable'?", options: ["Trivial", "Crucial", "Vague", "Superficial"], answer: "Crucial", explanation: "'Indispensable' có nghĩa là không thể thiếu, đồng nghĩa với 'Crucial' (quan trọng/cốt lõi)." },
          { id: "q3", question: "It is essential that he ______ the document immediately.", options: ["submits", "submit", "submitted", "submitting"], answer: "submit", explanation: "Cấu trúc giả định (Subjunctive mood): 'It is essential that + S + V (bare-infinitive)', do đó động từ 'submit' giữ nguyên mẫu không chia." },
          { id: "q4", question: "Seldom ______ such a beautiful scenery.", options: ["we see", "do we see", "we saw", "did we saw"], answer: "do we see", explanation: "Trạng từ phủ định 'Seldom' đứng đầu câu yêu cầu cấu trúc đảo ngữ: 'Seldom + Trợ động từ + S + V'." },
          { id: "q5", question: "Identify the word meaning a 'paradigm shift':", options: ["Fundamental change", "Small tweak", "Constant state", "Routine event"], answer: "Fundamental change", explanation: "'Paradigm shift' nghĩa là một sự thay đổi căn bản về tư duy hoặc mô hình (Fundamental change)." }
        ],
        essayPrompt: "Write an academic essay (150-200 words) discussing whether technology isolates people or brings them together."
      };
    } else {
      // Intermediate (Default)
      return {
        questions: [
          { id: "q1", question: "If it ______ tomorrow, we will stay at home.", options: ["rains", "rain", "will rain", "rained"], answer: "rains", explanation: "Câu điều kiện loại 1 (If + S + V(hiện tại đơn), S + will + V)." },
          { id: "q2", question: "I ______ in Ho Chi Minh City since 2021.", options: ["live", "lived", "have lived", "am living"], answer: "have lived", explanation: "Dấu hiệu 'since 2021' chỉ một hành động bắt đầu từ quá khứ kéo dài đến hiện tại, sử dụng thì Hiện tại hoàn thành." },
          { id: "q3", question: "She is interested ______ learning English.", options: ["on", "at", "in", "for"], answer: "in", explanation: "Cụm tính từ cố định: 'be interested in' (thích thú/quan tâm làm gì)." },
          { id: "q4", question: "By the time the bell rang, the teacher ______ the class.", options: ["started", "had started", "has started", "starts"], answer: "had started", explanation: "Hành động giáo viên bắt đầu lớp học xảy ra trước hành động tiếng chuông reo trong quá khứ, chia ở thì Quá khứ hoàn thành." },
          { id: "q5", question: "We decided to ______ the match due to rain.", options: ["put off", "put on", "take off", "call off"], answer: "call off", explanation: "'Call off' nghĩa là hủy bỏ trận đấu do thời tiết xấu." }
        ],
        essayPrompt: "Write a paragraph (100-120 words) about your dream holiday destinations."
      };
    }
  }
}

// 3. AI EVALUATE PROMOTION/RETENTION DECISION
export async function aiEvaluatePromotion(quizScore, essayText, currentLevel) {
  const systemInstruction = "You are an English academic director. You must analyze the student's progress test results (multiple-choice score and essay writing quality) and decide if the student should be upgraded to the next level (Promoted), kept in the same level (Retained), or downgraded (Demoted). You must return response in a strict JSON format containing keys: decision ('Promoted', 'Retained', 'Demoted'), explanation (string in Vietnamese), and newLevel (string: 'Basic', 'Intermediate', 'Advanced').";

  const prompt = `Evaluate the student's eligibility for promotion:
  - Current Class Level: ${currentLevel}
  - Multiple Choice Score: ${quizScore}/5
  - Submitted Essay Text: "${essayText}"
  
  Determine the level change:
  - If current level is "Basic", promotion goes to "Intermediate".
  - If current level is "Intermediate", promotion goes to "Advanced".
  - If current level is "Advanced", they cannot be promoted further (so keep them as "Advanced" but mark as "Promoted" to praise them, or "Retained").
  - Be strict: to be promoted, they need at least 4/5 in the quiz and a high-quality essay.
  
  Return only the JSON containing keys: decision, newLevel, and explanation (detailed reason in Vietnamese).`;

  try {
    const rawResult = await callGemini(prompt, systemInstruction);
    const cleaned = cleanJsonString(rawResult);
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Gemini Promotion evaluation failed, running rule-based fallback:", error.message);
    
    // Fallback logic
    const wordCount = essayText.split(/\s+/).filter(Boolean).length;
    let decision = "Retained";
    let newLevel = currentLevel;
    let explanation = `[Giả lập Offline] Kết quả trắc nghiệm đạt ${quizScore}/5 câu và bài viết đạt ${wordCount} từ. `;

    if (quizScore >= 4 && wordCount >= 30) {
      if (currentLevel === "Basic") {
        decision = "Promoted";
        newLevel = "Intermediate";
        explanation += "Chúc mừng! Bạn đã đạt yêu cầu để chuyển lên lớp Intermediate (Trung bình).";
      } else if (currentLevel === "Intermediate") {
        decision = "Promoted";
        newLevel = "Advanced";
        explanation += "Chúc mừng! Kỹ năng của bạn đã tiến bộ vượt bậc và đủ điều kiện chuyển lên lớp Advanced (Xuất sắc).";
      } else {
        decision = "Retained";
        newLevel = "Advanced";
        explanation += "Bạn đang ở cấp học cao nhất. Hãy tiếp tục duy trì phong độ xuất sắc này!";
      }
    } else {
      decision = "Retained";
      explanation += "Bạn cần luyện tập thêm từ vựng, ngữ pháp và viết câu dài hơn để đủ điều kiện nâng cấp trình độ.";
    }

    return { decision, newLevel, explanation };
  }
}

// 4. AI LESSON ASSISTANT CHAT
export async function aiLessonChat(message, lessonContext) {
  const systemInstruction = "You are a friendly and helpful English tutor. The student is asking a question about a lesson. You must explain clearly, politely, and use Vietnamese for explanations but provide English examples.";
  const prompt = `Student Question: "${message}"
  Lesson Context:
  - Title: ${lessonContext.title}
  - Level: ${lessonContext.level}
  - Grammar Point: ${lessonContext.grammarPoint}
  - Vocabulary Words: ${lessonContext.vocabulary}`;
  try {
    return await callGemini(prompt, systemInstruction);
  } catch (error) {
    return `[Trợ lý Offline] Rất tiếc, máy chủ AI đang bận. Câu trả lời gợi ý cho câu hỏi của bạn là: Hãy tập trung ôn luyện từ vựng và cấu trúc ngữ pháp có trong bài học!`;
  }
}

// 5. AI SPEAKING SIMULATOR CHAT
export async function aiSpeakingChat(message, history) {
  const systemInstruction = "You are an English conversation partner. Conduct a simulated speaking chat. Speak in natural English. For every response, you must structure it in two parts: first, a short correction/feedback on the student's grammar/word choice if any (marked with 'Feedback:'), and second, your reply continuing the conversation (marked with 'Reply:'). Respond concisely in under 80 words total.";
  const prompt = `Student Message: "${message}"
  Previous Conversation History:
  ${history.map(h => `${h.sender === 'user' ? 'Student' : 'AI'}: ${h.text}`).join('\n')}`;
  try {
    return await callGemini(prompt, systemInstruction);
  } catch (error) {
    return `Feedback: [Offline Mode] Your sentence is fine!\nReply: That sounds interesting! Can you tell me more about it?`;
  }
}
