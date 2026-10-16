import { calculateTargetPlan, calculateSubjectPriority } from './gpaCalculations.js';

export const ADVISOR_DISCLAIMER = 
  "Smart CGPA Advisor is an algorithmic decision-support tool. It does not replace official university counseling or degree audit systems.";

export const INITIAL_ADVISOR_MESSAGES = [
  {
    id: "welcome-1",
    sender: "advisor",
    timestamp: "Just now",
    text: `Hello! I'm your **Smart CGPA Advisor**. I analyze your live course credits, letter grades, and target goals to give you real-time mathematical strategies.`,
    quickReplies: [
      "How do I reach my target CGPA?",
      "Which subjects should I focus on first?",
      "Can I still graduate with honors (3.5+)?",
      "What GPA do I need next semester?",
    ],
  },
];

/**
 * Intelligent context-aware advisor response generator.
 * Inspects real-time state: student profile, semesters, target plan, priority subjects.
 */
export function generateAdvisorResponse(query, context) {
  const { student, semesters, stats, targetPlan, prioritySubjects } = context;
  const q = (query || "").toLowerCase().trim();

  const currentCGPA = stats.cgpa || 0.0;
  const targetCGPA = student.targetCGPA || 3.50;
  const remainingCredits = Math.max(0, (student.degreeTotalCredits || 130) - stats.totalCredits);
  const completedCredits = stats.completedCredits || stats.totalCredits;

  // Find top priority subjects
  const highPriority = prioritySubjects.filter(s => s.priority === 'HIGH');
  const topSubject = prioritySubjects[0];

  // 1. Check if user asked something like "My CGPA is X and I want Y..." or extracted numbers
  const numberMatches = q.match(/\b\d+(\.\d+)?\b/g);
  let customCurrent = null;
  let customTarget = null;

  if (numberMatches && numberMatches.length >= 2) {
    const n1 = parseFloat(numberMatches[0]);
    const n2 = parseFloat(numberMatches[1]);
    if (n1 <= 4.0 && n2 <= 4.0) {
      customCurrent = n1;
      customTarget = n2;
    }
  }

  // Question Category 1: Target CGPA / "How do I reach my target" / specific numbers
  if (
    customCurrent !== null && customTarget !== null ||
    q.includes("target") || 
    q.includes("reach") || 
    q.includes("achieve") || 
    q.includes("raise my cgpa") ||
    q.includes("want") && (q.includes("cgpa") || q.includes("gpa"))
  ) {
    const activeCurrent = customCurrent !== null ? customCurrent : currentCGPA;
    const activeTarget = customTarget !== null ? customTarget : targetCGPA;
    const activePlan = calculateTargetPlan(activeCurrent, completedCredits, remainingCredits, activeTarget);

    let subjectAdvice = "";
    if (topSubject) {
      subjectAdvice = `\n\n📌 **Immediate Highest-Leverage Subject:**\n* **${topSubject.name}** (${topSubject.credits} Credit Hours, Current: **${topSubject.grade}**)\n* Boosting this single subject to an **A** recovers **+${topSubject.qualityPointsGain} Quality Points** and raises your CGPA by **+${topSubject.potentialCgpaBoost}**!`;
    }

    if (activePlan.feasibility === "impossible") {
      return `### ⚠️ Feasibility Assessment: Mathematically Impossible\n` +
        `To jump from **${activeCurrent.toFixed(2)}** to **${activeTarget.toFixed(2)}** over your remaining **${remainingCredits} credit hours**, you would need an average GPA of **${activePlan.requiredGPA.toFixed(2)}**.\n\n` +
        `Because the maximum GPA scale is 4.00, this target cannot be reached without repeating prior failed courses.\n\n` +
        `* 🎯 **Highest Achievable CGPA:** **${activePlan.maxAchievableCGPA.toFixed(2)}** (if you earn straight A's in every remaining course).\n` +
        `* 💡 **Recommendation:** Adjust your target to **${activePlan.maxAchievableCGPA.toFixed(2)}** or speak with your registrar regarding course grade-replacement options.${subjectAdvice}`;
    }

    return `### 🎯 Strategy to Reach ${activeTarget.toFixed(2)} CGPA\n` +
      `Here is the exact mathematical breakdown based on your current standing:\n\n` +
      `* **Current CGPA:** \`${activeCurrent.toFixed(2)}\` | **Target CGPA:** \`${activeTarget.toFixed(2)}\`\n` +
      `* **Completed Credits:** \`${completedCredits}\` hrs | **Remaining Credits:** \`${remainingCredits}\` hrs\n` +
      `* **Required Future GPA:** **${activePlan.requiredGPA.toFixed(2)}** across all remaining semesters.\n` +
      `* **Feasibility Rating:** **${activePlan.statusBadge}** (${activePlan.guidance})\n\n` +
      `#### 🚀 Recommended Action Plan:\n` +
      `1. **Secure B+ to A grades in all future courses:** Maintain at least a **${activePlan.requiredGPA.toFixed(2)}** semester average.\n` +
      `2. **Focus on high-credit weight:** Courses with 3 or 4 credit hours contribute 3x to 4x more quality points than 1-credit labs.\n` +
      `3. **Protect your exam buffer:** Aim for >= 85% midterms to avoid dropping below a B+.${subjectAdvice}`;
  }

  // Question Category 2: Priority Subjects / "Which subjects should I focus on"
  if (
    q.includes("focus") || 
    q.includes("priority") || 
    q.includes("subject") || 
    q.includes("improve first") ||
    q.includes("hurting") ||
    q.includes("dragging")
  ) {
    if (!prioritySubjects || prioritySubjects.length === 0) {
      return `You haven't added any subjects yet! Head over to the **CGPA Calculator** tab and add your current semester subjects so I can prioritize them for you.`;
    }

    const highList = prioritySubjects.filter(s => s.priority === 'HIGH').slice(0, 3);
    const medList = prioritySubjects.filter(s => s.priority === 'MEDIUM').slice(0, 2);

    let highFormatted = highList.map(s => 
      `* 🔴 **${s.name}** (\`${s.code || 'Core'}\`)\n  - **${s.credits} Credits** | Current Grade: **${s.grade}**\n  - Potential CGPA Boost: **+${s.potentialCgpaBoost}** (+${s.qualityPointsGain} Quality Points)\n  - *Action:* ${s.recommendedAction}`
    ).join("\n\n");

    let medFormatted = medList.map(s => 
      `* 🟡 **${s.name}** (\`${s.credits} Cr\`, Grade **${s.grade}**): Headroom for **+${s.qualityPointsGain}** Quality Points.`
    ).join("\n");

    return `### ⚡ Smart Subject Priority Analysis\n` +
      `The advisor prioritizes subjects by **Impact Score = Credit Hours × (4.00 - Grade Points)**. High-credit courses with low grades are your greatest leverage point.\n\n` +
      `#### 🔥 High Priority Focus Areas:\n${highFormatted || "No critical high-priority deficiencies detected! Good job."}\n\n` +
      (medFormatted ? `#### 📈 Moderate Leverage Areas:\n${medFormatted}\n\n` : '') +
      `💡 **Advisor Rule of Thumb:** Spending 5 hours studying for a 4-credit course (like OOP or OS) gives twice the GPA return of studying 5 hours for a 1-credit or 2-credit elective!`;
  }

  // Question Category 3: Honors / Dean's List (3.50+ or 3.75+)
  if (
    q.includes("honor") || 
    q.includes("dean") || 
    q.includes("distinction") || 
    q.includes("3.5") || 
    q.includes("first class")
  ) {
    const honorsPlan = calculateTargetPlan(currentCGPA, completedCredits, remainingCredits, 3.50);
    const highestHonorsPlan = calculateTargetPlan(currentCGPA, completedCredits, remainingCredits, 3.75);

    return `### 🏆 Honors & Dean's List Pathway (3.50+ Threshold)\n` +
      `* **Your Current CGPA:** \`${currentCGPA.toFixed(2)}\`\n` +
      `* **Remaining Credits:** \`${remainingCredits}\` credit hours\n\n` +
      `#### 1. Dean's List / Distinction (3.50 CGPA):\n` +
      `* **Required Future GPA:** **${honorsPlan.requiredGPA.toFixed(2)}**\n` +
      `* **Feasibility:** **${honorsPlan.statusBadge}**\n` +
      `* ${honorsPlan.guidance}\n\n` +
      `#### 2. Highest Distinction (3.75 CGPA):\n` +
      `* **Required Future GPA:** **${highestHonorsPlan.requiredGPA.toFixed(2)}**\n` +
      `* **Max Achievable CGPA:** **${honorsPlan.maxAchievableCGPA.toFixed(2)}**\n\n` +
      `💡 **Action Step:** To secure Dean's List honors, prioritize courses with 3 or 4 credits (like your core programming and math courses) and avoid any grade below B+.`;
  }

  // Question Category 4: Next semester GPA required
  if (
    q.includes("next semester") || 
    q.includes("upcoming") || 
    q.includes("semester gpa") || 
    q.includes("what gpa do i need")
  ) {
    const req = targetPlan.isValid ? targetPlan.requiredGPA : 3.50;
    return `### 📅 Upcoming Semester Target Recommendation\n` +
      `To stay on track for your target **${targetCGPA.toFixed(2)} CGPA**:\n\n` +
      `* **Target Term GPA for Next Semester:** **${req > 4.0 ? '4.00 (Maximum possible)' : req.toFixed(2)}**\n` +
      `* **Current Term GPA Pace:** \`${stats.currentSemesterGPA.toFixed(2)}\`\n` +
      `* **Target Gap:** \`${(req - stats.currentSemesterGPA).toFixed(2)}\` GPA difference\n\n` +
      `#### 🎓 How to achieve a ${req.toFixed(2)} semester:\n` +
      `* Assuming a 15-credit load (5 courses × 3 credits):\n` +
      `  - Earning **3 A's** (4.0) and **2 B+'s** (3.33) yields a **3.73 Term GPA**.\n` +
      `  - Earning **4 A's** (4.0) and **1 B** (3.0) yields a **3.80 Term GPA**.\n` +
      `* Check out the **What-If Simulator** tab to test specific letter grades for each enrolled course!`;
  }

  // Question Category 5: Credit hours explanation
  if (
    q.includes("credit hour") || 
    q.includes("formula") || 
    q.includes("calculate") || 
    q.includes("math") || 
    q.includes("quality point")
  ) {
    return `### 📐 How CGPA and Credit Hours Work\n` +
      `University GPA uses a **weighted average** based on credit hours:\n\n` +
      `1. **Quality Points (QP):** \`Quality Points = Credit Hours × Grade Points\`\n` +
      `   * Example: 4 Cr course with **B+ (3.33)** = \`4 × 3.33 = 13.32 QP\`\n` +
      `   * Example: 1 Cr lab with **A (4.00)** = \`1 × 4.00 = 4.00 QP\`\n` +
      `2. **Semester GPA:** \`Total Semester QP ÷ Total Semester Credits\`\n` +
      `3. **Cumulative CGPA:** \`All Cumulative QP ÷ All Cumulative Credits\`\n\n` +
      `⭐ **Key Takeaway:** A 4-credit course has **4 times the impact** on your CGPA compared to a 1-credit lab! Always invest your preparation time in proportion to course credit hours.`;
  }

  // Fallback / General Academic Query
  return `### 💡 Academic Assessment for ${student.name || 'Student'}\n` +
    `Here is a snapshot of your current performance metrics:\n\n` +
    `* **Cumulative CGPA:** **${currentCGPA.toFixed(2)}** / 4.00\n` +
    `* **Target Goal:** **${targetCGPA.toFixed(2)}** (Remaining Credits: **${remainingCredits}**)\n` +
    `* **Required Future GPA:** **${targetPlan.requiredGPA.toFixed(2)}** (${targetPlan.statusBadge})\n` +
    (topSubject ? `* **Primary Leverage Course:** **${topSubject.name}** (${topSubject.credits} Cr, Grade ${topSubject.grade})\n` : '') +
    `\n#### 📌 Actionable Advice:\n` +
    `1. Use the **What-If Simulator** to see how boosting a single 'C' or 'C+' can rapidly elevate your overall standing.\n` +
    `2. Check the **Smart Subject Priority** table to see your courses ranked from highest to lowest GPA recovery potential.\n` +
    `3. Test scenarios in the **Predictor** tab to see your Best, Expected, and Worst case semester outcomes.`;
}
