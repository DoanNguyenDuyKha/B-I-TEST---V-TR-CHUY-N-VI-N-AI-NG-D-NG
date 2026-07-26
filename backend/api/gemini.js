

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

// 2. AI GENERATE PROGRESS TEST (10 Quizzes + 1 Writing based on curriculum lessons)
export async function aiGenerateProgressTest(level, lessonsSummary = "") {
  const systemInstruction = "You are an English test generator. You must always output responses in a strict JSON object representing a progress test matching the student's level. The JSON must contain: questions (a list of 10 multiple-choice questions, each containing fields: id, question, options as array of 4 strings, answer as the exact correct option string, and explanation as a string in Vietnamese explaining why this answer is correct) and essayPrompt (string).";
  
  const prompt = `Create a custom progress test for a student in the ${level} class.
  Here is the curriculum summary of the lessons they have just completed:
  ---
  ${lessonsSummary}
  ---
  The test must include:
  1. 10 multiple-choice grammar and vocabulary questions targeted specifically for ${level} level and based directly on testing the grammar points and vocabulary words taught in the lessons listed above.
  2. 1 writing essay prompt suited for ${level} level.
  Return only the JSON with keys: questions (array of 10 objects containing: id, question, options, answer, explanation) and essayPrompt (string).`;

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
          { id: "q5", question: "Choose the correct spelling:", options: ["English", "Englesh", "Inglish", "Englich"], answer: "English", explanation: "'English' (Tiếng Anh/người Anh) là cách viết chính tả đúng chuẩn duy nhất." },
          { id: "q6", question: "We ______ to the cinema last night.", options: ["go", "went", "gone", "going"], answer: "went", explanation: "Trạng từ chỉ thời gian 'last night' (tối qua) cho biết hành động đã kết thúc trong quá khứ, dùng thì Quá khứ đơn 'went'." },
          { id: "q7", question: "There ______ a book on the table.", options: ["is", "are", "am", "be"], answer: "is", explanation: "Chủ ngữ số ít 'a book' đi kèm cấu trúc 'There is'." },
          { id: "q8", question: "This is ______ apple.", options: ["a", "an", "the", "some"], answer: "an", explanation: "Từ 'apple' bắt đầu bằng nguyên âm 'a' nên dùng mạo từ 'an'." },
          { id: "q9", question: "They ______ playing football now.", options: ["is", "are", "am", "was"], answer: "are", explanation: "Thì Hiện tại tiếp diễn chỉ hành động đang xảy ra: 'They' số nhiều đi với 'are'." },
          { id: "q10", question: "What is the opposite of 'hot'?", options: ["Cold", "Warm", "Dry", "Wet"], answer: "Cold", explanation: "Từ trái nghĩa với 'hot' (nóng) là 'cold' (lạnh)." }
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
          { id: "q5", question: "Identify the word meaning a 'paradigm shift':", options: ["Fundamental change", "Small tweak", "Constant state", "Routine event"], answer: "Fundamental change", explanation: "'Paradigm shift' nghĩa là một sự thay đổi căn bản về tư duy hoặc mô hình (Fundamental change)." },
          { id: "q6", question: "No sooner ______ entered the house than it started to rain.", options: ["had he", "he had", "did he", "does he"], answer: "had he", explanation: "Cấu trúc đảo ngữ đảo trợ động từ lên trước chủ ngữ: 'No sooner + had + S + V3/ed + than + S + V2/ed'." },
          { id: "q7", question: "By next December, I ______ here for five years.", options: ["will have worked", "will work", "worked", "am working"], answer: "will have worked", explanation: "Diễn tả hành động sẽ hoàn thành trước một thời điểm trong tương lai, sử dụng thì Tương lai hoàn thành 'will have worked'." },
          { id: "q8", question: "Which word has the CLOSEST meaning to 'ubiquitous'?", options: ["Rare", "Omnipresent", "Local", "Sparse"], answer: "Omnipresent", explanation: "'Ubiquitous' nghĩa là có mặt khắp nơi, đồng nghĩa với 'Omnipresent'." },
          { id: "q9", question: "She behaved as if she ______ the owner of the house.", options: ["is", "were", "was", "be"], answer: "were", explanation: "Giả thuyết không có thật (as if / as though), sử dụng 'were' cho tất cả các ngôi chủ ngữ." },
          { id: "q10", question: "Under no circumstances ______ you reveal the password.", options: ["should", "must", "should you", "you should"], answer: "should you", explanation: "Cấu trúc đảo ngữ phủ định: 'Under no circumstances + Trợ động từ + S + V'." }
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
          { id: "q5", question: "We decided to ______ the match due to rain.", options: ["put off", "put on", "take off", "call off"], answer: "call off", explanation: "'Call off' nghĩa là hủy bỏ trận đấu do thời tiết xấu." },
          { id: "q6", question: "While I ______ TV, the phone rang.", options: ["watch", "watched", "was watching", "am watching"], answer: "was watching", explanation: "Diễn tả hành động đang xảy ra (chia thì Quá khứ tiếp diễn 'was watching') thì hành động khác xen vào (chia thì Quá khứ đơn 'rang')." },
          { id: "q7", question: "This is the boy ______ won the first prize.", options: ["who", "which", "whom", "whose"], answer: "who", explanation: "Đại từ quan hệ thay thế cho danh từ chỉ người đóng vai trò chủ ngữ trong câu mệnh đề quan hệ là 'who'." },
          { id: "q8", question: "He is ______ at English than his brother.", options: ["good", "better", "best", "well"], answer: "better", explanation: "So sánh hơn của tính từ bất quy tắc 'good' là 'better'." },
          { id: "q9", question: "You ______ smoke in the hospital.", options: ["mustn't", "don't have to", "needn't", "should"], answer: "mustn't", explanation: "Chỉ sự cấm đoán, bắt buộc không được làm gì: 'mustn't'." },
          { id: "q10", question: "She has been working here ______ ten years.", options: ["since", "for", "during", "in"], answer: "for", explanation: "Sử dụng 'for + khoảng thời gian' (ten years) để chỉ thời lượng của hành động." }
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
  - Multiple Choice Score: ${quizScore}/10
  - Submitted Essay Text: "${essayText}"
  
  Determine the level change:
  - If current level is "Basic", promotion goes to "Intermediate".
  - If current level is "Intermediate", promotion goes to "Advanced".
  - If current level is "Advanced", they cannot be promoted further (so keep them as "Advanced" but mark as "Promoted" to praise them, or "Retained").
  - Be strict: to be promoted, they need at least 8/10 in the quiz and a high-quality essay.
  
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
    let explanation = `[Giả lập Offline] Kết quả trắc nghiệm đạt ${quizScore}/10 câu và bài viết đạt ${wordCount} từ. `;

    if (quizScore >= 8 && wordCount >= 30) {
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

// 6. AI GENERATE PLACEMENT TEST (10 Quizzes + Essay Prompt based on target)
export async function aiGeneratePlacementTest(target) {
  const systemInstruction = "You are an English test generator. You must always output responses in a strict JSON object representing a placement test matching the student's learning target. The JSON must contain: questions (a list of 10 multiple-choice questions, each containing fields: id, question, options as array of 4 strings, answer as the exact correct option string, and explanation as a string in Vietnamese explaining why this answer is correct) and essayPrompt (string).";

  const prompt = `Create a custom placement test for a student whose learning target is "${target}".
  The test must include:
  1. 10 multiple-choice grammar and vocabulary questions targeted specifically for their target "${target}". For example, if target is IELTS, use IELTS-style academic vocab/grammar. If TOEIC, use business/office contexts. If Communication (Giao tiếp), use daily conversation.
  2. 1 reading & essay writing prompt suited for target "${target}".
  Return only the JSON with keys: questions (array of 10 objects containing: id, question, options, answer, explanation) and essayPrompt (string).`;

  try {
    const rawResult = await callGemini(prompt, systemInstruction);
    const cleaned = cleanJsonString(rawResult);
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Gemini Placement Test Generation failed, using static fallback for target:", target);
    return null;
  }
}

// 7. AI GENERATE CUSTOM CURRICULUM (Dynamic customized lessons based on target and placement test score)
export async function aiGenerateCustomCurriculum(classification, target) {
  const systemInstruction = "You are an English syllabus designer. You must always return response in a strict JSON array containing exactly 3 highly detailed, premium lesson objects. Do NOT include any IT, programming, computer science, or technology-heavy topics. Focus entirely on daily communications, general networking, food, travel, art, social life, and conversational topics. The JSON array must contain exactly 3 objects. Each object must have keys: level, title, description, vocabulary (array of 5 objects containing: word, ipa, type, meaning, example), grammar (object with keys: point, explanation, structures as array of strings), reading (object with keys: title, content, questions as array of exactly 10 multiple-choice questions where each question has fields: id, question, options as array of 4 strings, answer as the exact correct option string), and essayPrompt (string). All explanations and meanings must be in Vietnamese.";

  const prompt = `Design exactly 3 highly detailed, customized English lessons for a student classified at level "${classification}" with the learning target "${target}".
  
  The topics should align closely with the target "${target}" and should be practical, everyday communication or life-related, avoiding any IT/programming topics.
  
  Each of the 3 lessons must contain:
  1. level: "${classification}"
  2. title: Detailed and descriptive title.
  3. description: Brief summary of what the student will learn.
  4. vocabulary: Exactly 5 vocabulary words. Each word has fields: word, ipa, type, meaning (Vietnamese), example (English).
  5. grammar: Object with fields: point, explanation (Vietnamese), structures (Array of strings).
  6. reading: Object with fields: title, content (detailed reading passage of ~100 words), questions (exactly 10 multiple choice questions testing reading and grammar, each containing: id ('q1' to 'q10'), question, options (4 options), answer (the exact correct option string)).
  7. essayPrompt: Exactly 1 writing prompt (Vietnamese description) matching this lesson's theme.
  
  Return only the JSON array containing exactly 3 objects. Ensure it is well-formed JSON.`;

  try {
    const rawResult = await callGemini(prompt, systemInstruction);
    const cleaned = cleanJsonString(rawResult);
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn("Gemini Custom Curriculum Generation failed, returning null:", error.message);
    return null;
  }
}

// 8. AI DYNAMIC GUIDANCE MESSAGE
export async function aiGenerateStudentGuidance(studentInfo, lessonsList, completedCount) {
  const systemInstruction = "You are a friendly and professional English academic counselor. You must greet the student in Vietnamese, summarize their progress, and encourage them to continue to their next lesson. Keep the response brief, warm, inspiring, and limited to 2-3 sentences.";
  
  const lessonsStatusStr = lessonsList.map((l, i) => `${i+1}. ${l.title}`).join('\n');
  const nextLesson = lessonsList[completedCount] ? lessonsList[completedCount].title : "bài thi nâng hạng lớp";

  const prompt = `Student Name: ${studentInfo.fullName || studentInfo.username}
  Learning Target: ${studentInfo.target}
  Current Level: ${studentInfo.classification}
  Completed Lessons Count: ${completedCount} out of ${lessonsList.length}
  Custom Lessons List:
  ${lessonsStatusStr}
  
  Next target is: ${nextLesson}.
  Write a friendly, polite, and encouraging message summarizing what they accomplished and motivating them to study the next step: "${nextLesson}".`;

  try {
    return await callGemini(prompt, systemInstruction);
  } catch (error) {
    return `Chào bạn! Bạn đã hoàn thành ${completedCount}/${lessonsList.length} bài học. Hãy tiếp tục cố gắng hoàn thành bài học tiếp theo "${nextLesson}" để tích lũy kiến thức vững chắc nhé!`;
  }
}
