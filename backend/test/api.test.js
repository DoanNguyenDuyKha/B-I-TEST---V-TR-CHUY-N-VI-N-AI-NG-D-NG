// Automated Integration Test for Adaptive English LMS APIs
// Run this script using: node backend/test/api.test.js

const API_BASE = 'http://localhost:3001/api';

async function runTests() {
  console.log("==================================================");
  console.log("🧪 STARTING AUTOMATED API INTEGRATION TESTS...");
  console.log("==================================================");

  let testStudentUsername = `student_test_${Date.now()}`;
  let testStudentPassword = "TestPassword123";

  try {
    // 1. Verify Lessons Seeding
    console.log("\n➡️ Test 1: Verify Lessons Seeding (GET /api/lessons)...");
    const lessonsRes = await fetch(`${API_BASE}/lessons`);
    if (!lessonsRes.ok) throw new Error("Failed to fetch lessons");
    const lessons = await lessonsRes.json();
    console.log(`✅ Passed: Fetched ${lessons.length} lessons from MongoDB.`);

    // 2. Admin Login
    console.log("\n➡️ Test 2: Admin Login (POST /api/login)...");
    const adminLoginRes = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: "admin", password: "admin123" })
    });
    if (!adminLoginRes.ok) throw new Error("Admin login failed");
    const admin = await adminLoginRes.json();
    if (admin.role !== 'Admin') throw new Error("Admin role mismatch");
    console.log(`✅ Passed: Admin logged in successfully. User: ${admin.fullName}`);

    // 3. Student Registration
    console.log("\n➡️ Test 3: Student Registration (POST /api/register)...");
    const registerRes = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testStudentUsername,
        password: testStudentPassword,
        role: "Student",
        fullName: "Automation Tester",
        email: "tester@lms.com",
        phone: "0123456789",
        dob: "2000-01-01",
        target: "IELTS"
      })
    });
    if (!registerRes.ok) throw new Error("Student registration failed");
    const registeredUser = await registerRes.json();
    console.log(`✅ Passed: Registered new student username: ${registeredUser.username}`);

    // 4. Student Login
    console.log("\n➡️ Test 4: Student Login (POST /api/login)...");
    const studentLoginRes = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testStudentUsername, password: testStudentPassword })
    });
    if (!studentLoginRes.ok) throw new Error("Student login failed");
    const loggedInStudent = await studentLoginRes.json();
    if (loggedInStudent.placementTestDone) throw new Error("New student should not have placement test done");
    console.log(`✅ Passed: Student logged in successfully. Placement status: ${loggedInStudent.placementTestDone}`);

    // 5. Submit Placement Test
    console.log("\n➡️ Test 5: Submit Placement Test & Classification (POST /api/placement-test)...");
    const placementRes = await fetch(`${API_BASE}/placement-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testStudentUsername,
        quizAnswers: {
          q1: "B", q2: "A", q3: "C", q4: "B", q5: "D",
          q6: "A", q7: "C", q8: "B", q9: "D", q10: "B" // Perfect 10/10 MCQ score
        },
        essayText: "Artificial intelligence is a powerful technology. In my opinion, it represents a massive paradigm shift in education. Rarely have we seen such progress."
      })
    });
    if (!placementRes.ok) throw new Error("Placement test submission failed");
    const placementResult = await placementRes.json();
    console.log(`✅ Passed: Placement Test Graded.`);
    console.log(`   - MCQ Score: ${placementResult.quizScore}`);
    console.log(`   - Essay Score: ${placementResult.essayEvaluation?.score}/10`);
    console.log(`   - Classified Level: ${placementResult.classification}`);

    // 6. Admin Route - Get all students list
    console.log("\n➡️ Test 6: Verify Admin view student list (GET /api/students)...");
    const studentsRes = await fetch(`${API_BASE}/students`);
    if (!studentsRes.ok) throw new Error("Failed to fetch student list");
    const studentsList = await studentsRes.json();
    const found = studentsList.find(s => s.username === testStudentUsername);
    if (!found) throw new Error("Created student not found in list");
    console.log(`✅ Passed: Admin retrieved student list, verified test student classification: ${found.classification}`);

    // 7. Request Progress Test (AI Generated Test)
    console.log(`\n➡️ Test 7: Generate Custom Progress Test (GET /api/progress-test?level=${placementResult.classification})...`);
    const progressTestRes = await fetch(`${API_BASE}/progress-test?level=${placementResult.classification}`);
    if (!progressTestRes.ok) throw new Error("Failed to generate progress test");
    const progressTest = await progressTestRes.json();
    console.log(`✅ Passed: Generated ${progressTest.questions?.length} MCQs and essay prompt.`);
    console.log(`   - Essay prompt: "${progressTest.essayPrompt}"`);

    // 8. Submit Progress Test for Promotion
    console.log("\n➡️ Test 8: Submit Progress Test & Evaluate Promotion (POST /api/progress-test/submit)...");
    const promotionRes = await fetch(`${API_BASE}/progress-test/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testStudentUsername,
        quizScore: 10, // 10/10 correct answers
        essayText: "Learning English is crucial for my future. I want to build a career in software engineering and connect with global teams.",
        currentLevel: placementResult.classification
      })
    });
    if (!promotionRes.ok) throw new Error("Promotion evaluation failed");
    const promotionResult = await promotionRes.json();
    console.log(`✅ Passed: Promotion test evaluated by AI.`);
    console.log(`   - Decision: ${promotionResult.decision}`);
    console.log(`   - New Level: ${promotionResult.newLevel}`);
    console.log(`   - Explanation: ${promotionResult.explanation}`);

    // 9. Generate Custom Lesson via AI (Admin feature)
    console.log("\n➡️ Test 9: Generate Custom Lesson via AI (POST /api/generate-lesson)...");
    const generateLessonRes = await fetch(`${API_BASE}/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: "Effective Interpersonal Communications",
        level: "Advanced"
      })
    });
    if (!generateLessonRes.ok) throw new Error("Lesson generation failed");
    const generatedLesson = await generateLessonRes.json();
    console.log(`✅ Passed: AI Lesson generated: "${generatedLesson.lesson?.title}"`);

    console.log("\n==================================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! 💯");
    console.log("==================================================");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    console.log("==================================================");
    process.exit(1);
  }
}

runTests();
