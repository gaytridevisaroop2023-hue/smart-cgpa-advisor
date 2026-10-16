import { getGradePoints } from '../data/gradeScale.js';

/**
 * Calculates credit hours, total quality points, and GPA for a single semester.
 */
export function calculateSemesterStats(semester) {
  if (!semester || !Array.isArray(semester.subjects)) {
    return { credits: 0, qualityPoints: 0, gpa: 0 };
  }

  let credits = 0;
  let qualityPoints = 0;

  for (const sub of semester.subjects) {
    const cred = parseFloat(sub.credits) || 0;
    const pts = getGradePoints(sub.grade);
    credits += cred;
    qualityPoints += cred * pts;
  }

  const gpa = credits > 0 ? parseFloat((qualityPoints / credits).toFixed(2)) : 0.00;

  return {
    credits,
    qualityPoints: parseFloat(qualityPoints.toFixed(2)),
    gpa,
  };
}

/**
 * Calculates overall cumulative academic stats across all semesters.
 */
export function calculateCumulativeStats(semesters) {
  if (!semesters || semesters.length === 0) {
    return {
      totalCredits: 0,
      totalQualityPoints: 0,
      cgpa: 0,
      completedCredits: 0,
      completedQualityPoints: 0,
      completedCGPA: 0,
      currentSemesterGPA: 0,
      currentSemesterCredits: 0,
      currentSemesterQualityPoints: 0,
    };
  }

  let totalCredits = 0;
  let totalQualityPoints = 0;

  let completedCredits = 0;
  let completedQualityPoints = 0;

  // Identify current semester (last one or one with isCompleted === false)
  const currentSemester = semesters.find(s => !s.isCompleted) || semesters[semesters.length - 1];
  const currentStats = calculateSemesterStats(currentSemester);

  for (const sem of semesters) {
    const stats = calculateSemesterStats(sem);
    totalCredits += stats.credits;
    totalQualityPoints += stats.qualityPoints;

    if (sem.isCompleted) {
      completedCredits += stats.credits;
      completedQualityPoints += stats.qualityPoints;
    }
  }

  const cgpa = totalCredits > 0 ? parseFloat((totalQualityPoints / totalCredits).toFixed(2)) : 0.00;
  const completedCGPA = completedCredits > 0 ? parseFloat((completedQualityPoints / completedCredits).toFixed(2)) : 0.00;

  return {
    totalCredits,
    totalQualityPoints: parseFloat(totalQualityPoints.toFixed(2)),
    cgpa,
    completedCredits,
    completedQualityPoints: parseFloat(completedQualityPoints.toFixed(2)),
    completedCGPA,
    currentSemesterGPA: currentStats.gpa,
    currentSemesterCredits: currentStats.credits,
    currentSemesterQualityPoints: currentStats.qualityPoints,
    currentSemesterId: currentSemester?.id,
  };
}

/**
 * What-If Simulator:
 * Computes projected CGPA given modifications to subjects' grades.
 * modifiedGradesMap: { [subjectId]: newGradeLetter }
 */
export function calculateWhatIfCGPA(semesters, modifiedGradesMap = {}) {
  let simulatedQualityPoints = 0;
  let totalCredits = 0;
  const changedSubjects = [];

  for (const sem of semesters) {
    for (const sub of sem.subjects) {
      const cred = parseFloat(sub.credits) || 0;
      const originalPoints = getGradePoints(sub.grade);
      const isModified = Object.prototype.hasOwnProperty.call(modifiedGradesMap, sub.id);
      const activeGrade = isModified ? modifiedGradesMap[sub.id] : sub.grade;
      const simulatedPoints = getGradePoints(activeGrade);

      totalCredits += cred;
      simulatedQualityPoints += cred * simulatedPoints;

      if (isModified && modifiedGradesMap[sub.id] !== sub.grade) {
        changedSubjects.push({
          id: sub.id,
          name: sub.name,
          code: sub.code,
          credits: cred,
          originalGrade: sub.grade,
          originalPoints,
          simulatedGrade: modifiedGradesMap[sub.id],
          simulatedPoints,
          pointsDiff: parseFloat(((simulatedPoints - originalPoints) * cred).toFixed(2)),
        });
      }
    }
  }

  const simulatedCGPA = totalCredits > 0 ? parseFloat((simulatedQualityPoints / totalCredits).toFixed(2)) : 0.00;
  return {
    simulatedCGPA,
    simulatedQualityPoints: parseFloat(simulatedQualityPoints.toFixed(2)),
    totalCredits,
    changedSubjects,
  };
}

/**
 * Target CGPA Planner:
 * Calculates required future GPA to hit target CGPA given completed credits & remaining credits.
 */
export function calculateTargetPlan(currentCGPA, completedCredits, remainingCredits, targetCGPA) {
  const curGPA = parseFloat(currentCGPA) || 0;
  const doneCred = parseFloat(completedCredits) || 0;
  const remCred = parseFloat(remainingCredits) || 0;
  const tgtGPA = parseFloat(targetCGPA) || 0;

  if (remCred <= 0) {
    return {
      isValid: false,
      message: "Remaining credit hours must be greater than 0.",
      requiredGPA: 0,
      feasibility: "error",
      maxAchievableCGPA: curGPA,
    };
  }

  const totalCredits = doneCred + remCred;
  const currentQualityPoints = curGPA * doneCred;
  const targetQualityPoints = tgtGPA * totalCredits;
  const requiredQualityPoints = targetQualityPoints - currentQualityPoints;
  const rawRequiredGPA = requiredQualityPoints / remCred;
  const requiredGPA = parseFloat(rawRequiredGPA.toFixed(2));

  // Max achievable if student gets 4.0 in all remaining credits
  const maxAchievableCGPA = parseFloat(((currentQualityPoints + (4.00 * remCred)) / totalCredits).toFixed(2));
  // Min achievable if student gets 0.0 in all remaining credits
  const minAchievableCGPA = parseFloat(((currentQualityPoints) / totalCredits).toFixed(2));

  let feasibility = "feasible";
  let statusBadge = "Highly Feasible";
  let statusColor = "emerald";
  let guidance = "";

  if (requiredGPA <= 0) {
    feasibility = "already_achieved";
    statusBadge = "Already Exceeded";
    statusColor = "emerald";
    guidance = `Your current CGPA (${curGPA.toFixed(2)}) is already higher than your target (${tgtGPA.toFixed(2)}). Even with passing grades, you will easily hit your goal!`;
  } else if (requiredGPA <= 3.00) {
    feasibility = "very_feasible";
    statusBadge = "Easily Attainable";
    statusColor = "emerald";
    guidance = `Requires an average GPA of ${requiredGPA.toFixed(2)} (B / B- range) across your remaining ${remCred} credit hours. Highly within reach with standard study habits.`;
  } else if (requiredGPA <= 3.50) {
    feasibility = "moderate";
    statusBadge = "Moderate Challenge";
    statusColor = "blue";
    guidance = `Requires a steady ${requiredGPA.toFixed(2)} GPA (B+ to A- range). Keep focused on coursework and high-credit projects.`;
  } else if (requiredGPA <= 3.85) {
    feasibility = "challenging";
    statusBadge = "Intense Focus Required";
    statusColor = "amber";
    guidance = `Requires an aggressive ${requiredGPA.toFixed(2)} GPA across remaining semesters (mostly straight A's with occasional A-). Priority subject management is essential.`;
  } else if (requiredGPA <= 4.00) {
    feasibility = "extreme";
    statusBadge = "Near Perfection (Straight A's)";
    statusColor = "rose";
    guidance = `Requires a near-flawless ${requiredGPA.toFixed(2)} GPA! You cannot afford any grade below A/A- in any remaining course.`;
  } else {
    feasibility = "impossible";
    statusBadge = "Mathematically Impossible";
    statusColor = "rose";
    guidance = `To reach ${tgtGPA.toFixed(2)}, you would need a ${requiredGPA.toFixed(2)} GPA, which exceeds the university's maximum 4.00 GPA ceiling. The highest possible CGPA you can graduate with is ${maxAchievableCGPA.toFixed(2)} (if you earn straight A's in every remaining credit).`;
  }

  // Breakdown across semesters (assuming standard 15 credits per semester)
  const remainingSemestersCount = Math.ceil(remCred / 15) || 1;
  const semesterBreakdown = [];
  let creditsAccounted = 0;

  for (let i = 1; i <= remainingSemestersCount; i++) {
    const creditsThisSem = Math.min(15, remCred - creditsAccounted);
    creditsAccounted += creditsThisSem;
    semesterBreakdown.push({
      semesterIndex: i,
      name: `Upcoming Semester ${i}`,
      credits: creditsThisSem,
      requiredTermGPA: Math.min(4.00, Math.max(0, requiredGPA)),
    });
  }

  return {
    isValid: true,
    requiredGPA,
    rawRequiredGPA,
    maxAchievableCGPA,
    minAchievableCGPA,
    feasibility,
    statusBadge,
    statusColor,
    guidance,
    remainingSemestersCount,
    semesterBreakdown,
  };
}

/**
 * Smart Subject Priority Engine:
 * Analyzes subjects based on current grade, credit hours, and impact score.
 * Formula: Impact Score = Credit Hours * (4.00 - Current Grade Points)
 */
export function calculateSubjectPriority(semesters) {
  if (!semesters || semesters.length === 0) return [];

  const overall = calculateCumulativeStats(semesters);
  const totalCredits = overall.totalCredits || 1;

  const subjectList = [];

  for (const sem of semesters) {
    for (const sub of sem.subjects) {
      const cred = parseFloat(sub.credits) || 0;
      const pts = getGradePoints(sub.grade);
      const pointsDiff = (4.00 - pts); // points lost compared to A (4.0)
      const qualityPointsGain = cred * pointsDiff;
      const potentialCgpaBoost = parseFloat((qualityPointsGain / totalCredits).toFixed(3));

      // Determine priority level
      let priority = 'LOW';
      let priorityBadgeClass = 'priority-low';
      let rationale = '';
      let recommendedAction = '';

      if (pointsDiff <= 0.05) {
        priority = 'LOW';
        priorityBadgeClass = 'priority-low';
        rationale = `Already mastered at grade ${sub.grade} (4.0). No further GPA headroom available.`;
        recommendedAction = 'Maintain current study discipline. Excellent performance!';
      } else if (cred >= 3 && pts <= 2.33) {
        // High credit (3-4 cr) with C+, C, C-, D, F
        priority = 'HIGH';
        priorityBadgeClass = 'priority-high';
        rationale = `High credit load (${cred} Cr) combined with low grade (${sub.grade}). Upgrading to 'A' recovers ${qualityPointsGain.toFixed(1)} quality points (+${potentialCgpaBoost.toFixed(2)} to overall CGPA).`;
        recommendedAction = 'Top priority for grade replacement, retake, or concentrated office hours support.';
      } else if (cred >= 4 || (cred >= 3 && pts <= 3.00)) {
        // 4 cr with B/B- or 3 cr with B/B-
        priority = 'MEDIUM';
        priorityBadgeClass = 'priority-medium';
        rationale = `Moderate leverage (${cred} Cr, Grade ${sub.grade}). Upgrading to 'A' will add ${qualityPointsGain.toFixed(1)} quality points (+${potentialCgpaBoost.toFixed(2)} to overall CGPA).`;
        recommendedAction = 'Strong candidate for boosting final project/exam scores into the A- / A tier.';
      } else if (cred <= 1 || pts >= 3.67) {
        priority = 'LOW';
        priorityBadgeClass = 'priority-low';
        rationale = cred <= 1 
          ? `Low credit weight (${cred} Cr). Upgrading to 'A' only yields +${qualityPointsGain.toFixed(1)} quality points (+${potentialCgpaBoost.toFixed(2)} CGPA impact).`
          : `High performance grade (${sub.grade}). Room for gain is minimal (+${qualityPointsGain.toFixed(1)} pts).`;
        recommendedAction = 'Keep steady; focus primary study hours on higher-credit courses.';
      } else {
        priority = 'MEDIUM';
        priorityBadgeClass = 'priority-medium';
        rationale = `${cred} credit hours at grade ${sub.grade}. Potential to gain ${qualityPointsGain.toFixed(1)} quality points.`;
        recommendedAction = 'Dedicate consistent weekly review time to push toward an A.';
      }

      subjectList.push({
        id: sub.id,
        code: sub.code,
        name: sub.name,
        semesterName: sem.name,
        semesterId: sem.id,
        isCurrentSemester: !sem.isCompleted,
        credits: cred,
        grade: sub.grade,
        gradePoints: pts,
        qualityPointsGain: parseFloat(qualityPointsGain.toFixed(1)),
        potentialCgpaBoost,
        priority,
        priorityBadgeClass,
        rationale,
        recommendedAction,
      });
    }
  }

  // Sort by Quality Points Gain descending (highest impact first)
  subjectList.sort((a, b) => b.qualityPointsGain - a.qualityPointsGain);

  return subjectList;
}

/**
 * Best / Expected / Worst Case Predictor
 * Computes scenario outcomes for the current semester or specified upcoming credits.
 */
export function calculateScenarios(semesters, customExpectedGPA = null) {
  const currentSemester = semesters.find(s => !s.isCompleted) || semesters[semesters.length - 1];
  const completedSemesters = semesters.filter(s => s.id !== currentSemester?.id);

  let prevCredits = 0;
  let prevQualityPoints = 0;

  for (const sem of completedSemesters) {
    const s = calculateSemesterStats(sem);
    prevCredits += s.credits;
    prevQualityPoints += s.qualityPoints;
  }

  const currentStats = calculateSemesterStats(currentSemester);
  const termCredits = currentStats.credits > 0 ? currentStats.credits : 15; // default 15 credits if empty

  // Best Case: Straight A's (4.00)
  const bestTermGPA = 4.00;
  const bestQualityPoints = termCredits * bestTermGPA;
  const bestCGPA = parseFloat(((prevQualityPoints + bestQualityPoints) / (prevCredits + termCredits)).toFixed(2));

  // Expected Case: Current semester actual pace or average CGPA so far
  const prevCGPA = prevCredits > 0 ? prevQualityPoints / prevCredits : 3.00;
  const expTermGPA = customExpectedGPA !== null 
    ? parseFloat(customExpectedGPA) 
    : (currentStats.gpa > 0 ? currentStats.gpa : parseFloat(prevCGPA.toFixed(2)));
  const expQualityPoints = termCredits * expTermGPA;
  const expCGPA = parseFloat(((prevQualityPoints + expQualityPoints) / (prevCredits + termCredits)).toFixed(2));

  // Worst Case: Minimum passing baseline (e.g. 2.00 / C average)
  const worstTermGPA = 2.00;
  const worstQualityPoints = termCredits * worstTermGPA;
  const worstCGPA = parseFloat(((prevQualityPoints + worstQualityPoints) / (prevCredits + termCredits)).toFixed(2));

  return {
    termCredits,
    best: {
      termGPA: bestTermGPA,
      projectedCGPA: bestCGPA,
      label: "Best Case (Straight A's)",
      description: "Perfect 4.00 performance across all enrolled courses.",
      color: "emerald",
    },
    expected: {
      termGPA: parseFloat(expTermGPA.toFixed(2)),
      projectedCGPA: expCGPA,
      label: "Expected Case (Realistic Trend)",
      description: `Projected based on current term pace (${expTermGPA.toFixed(2)} GPA).`,
      color: "indigo",
    },
    worst: {
      termGPA: worstTermGPA,
      projectedCGPA: worstCGPA,
      label: "Worst Case (Floor Baseline)",
      description: "Passing floor of C grades (2.00 GPA) in all enrolled courses.",
      color: "amber",
    },
    spread: parseFloat((bestCGPA - worstCGPA).toFixed(2)),
  };
}

/**
 * CGPA Risk Alert & Academic Health Monitor
 */
export function determineRiskAlert(currentCGPA, projectedCGPA, targetCGPA, highPriorityCount = 0) {
  const delta = parseFloat((projectedCGPA - currentCGPA).toFixed(2));

  if (projectedCGPA < 2.00) {
    return {
      type: 'danger',
      title: '🚨 Critical Academic Probation Risk',
      message: `Your projected CGPA (${projectedCGPA.toFixed(2)}) is below the university graduation threshold of 2.00. Urgent academic intervention is required.`,
      advice: 'Schedule an immediate advising meeting, withdraw or repeat D/F subjects, and utilize university tutoring centers.',
    };
  }

  if (delta < -0.05) {
    return {
      type: 'warning',
      title: '⚠️ Negative Trajectory Alert',
      message: `Your projected CGPA may decrease by ${Math.abs(delta).toFixed(2)} points (from ${currentCGPA.toFixed(2)} to ${projectedCGPA.toFixed(2)}).`,
      advice: `Focus your study hours immediately on ${highPriorityCount} high-credit subjects to reverse the downward trend.`,
    };
  }

  if (projectedCGPA >= targetCGPA && targetCGPA > 0) {
    return {
      type: 'success',
      title: '🎯 Target Reached & Surpassed!',
      message: `Great! Your projected CGPA (${projectedCGPA.toFixed(2)}) meets or exceeds your goal of ${targetCGPA.toFixed(2)}.`,
      advice: 'Maintain your current coursework rhythm and exam preparation to solidify this academic achievement.',
    };
  }

  if (delta > 0.05) {
    return {
      type: 'success',
      title: '🌟 Positive Growth Trend',
      message: `Great! Your academic performance is improving (+${delta.toFixed(2)} CGPA increase projected).`,
      advice: 'Your proactive efforts are paying off. Continue prioritizing high-credit core courses.',
    };
  }

  return {
    type: 'info',
    title: '📊 Steady Academic Standing',
    message: `Your projected CGPA (${projectedCGPA.toFixed(2)}) is consistent with your current standing (${currentCGPA.toFixed(2)}).`,
    advice: 'To break into higher honors tiers, focus on boosting your 3-credit and 4-credit course grades.',
  };
}
