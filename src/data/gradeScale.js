// Standard 4.0 Grading Scale (North American & International Standard)
export const GRADE_SCALE = [
  { grade: 'A', points: 4.00, percentage: '90 - 100%', description: 'Excellent / Outstanding' },
  { grade: 'A-', points: 3.67, percentage: '85 - 89%', description: 'Superior' },
  { grade: 'B+', points: 3.33, percentage: '80 - 84%', description: 'Very Good' },
  { grade: 'B', points: 3.00, percentage: '75 - 79%', description: 'Good' },
  { grade: 'B-', points: 2.67, percentage: '70 - 74%', description: 'Above Average' },
  { grade: 'C+', points: 2.33, percentage: '65 - 69%', description: 'Average' },
  { grade: 'C', points: 2.00, percentage: '60 - 64%', description: 'Satisfactory / Minimum Core Pass' },
  { grade: 'C-', points: 1.67, percentage: '55 - 59%', description: 'Marginal Pass' },
  { grade: 'D+', points: 1.33, percentage: '52 - 54%', description: 'Low Pass' },
  { grade: 'D', points: 1.00, percentage: '50 - 51%', description: 'Bare Minimum Pass' },
  { grade: 'F', points: 0.00, percentage: '< 50%', description: 'Fail / No Credit' },
];

export const GRADE_POINTS_MAP = GRADE_SCALE.reduce((acc, item) => {
  acc[item.grade] = item.points;
  return acc;
}, {});

export function getGradePoints(grade) {
  if (GRADE_POINTS_MAP[grade] !== undefined) {
    return GRADE_POINTS_MAP[grade];
  }
  const parsed = parseFloat(grade);
  return isNaN(parsed) ? 0 : parsed;
}

export function getGradeLabel(points) {
  for (const item of GRADE_SCALE) {
    if (Math.abs(item.points - points) < 0.05) return item.grade;
  }
  if (points >= 3.85) return 'A';
  if (points >= 3.5) return 'A-';
  if (points >= 3.15) return 'B+';
  if (points >= 2.85) return 'B';
  if (points >= 2.5) return 'B-';
  if (points >= 2.15) return 'C+';
  if (points >= 1.85) return 'C';
  if (points >= 1.5) return 'C-';
  if (points >= 1.15) return 'D+';
  if (points >= 0.85) return 'D';
  return 'F';
}

export function getAcademicStanding(cgpa) {
  if (cgpa >= 3.75) return { status: "Highest Distinction", badge: "Summa Cum Laude", color: "emerald", level: "high" };
  if (cgpa >= 3.50) return { status: "Dean's List / Distinction", badge: "Magna Cum Laude", color: "emerald", level: "high" };
  if (cgpa >= 3.00) return { status: "Good Standing", badge: "Above Average", color: "blue", level: "good" };
  if (cgpa >= 2.50) return { status: "Satisfactory", badge: "Average", color: "amber", level: "warning" };
  if (cgpa >= 2.00) return { status: "Academic Concern", badge: "Low Pass", color: "amber", level: "warning" };
  return { status: "Academic Probation", badge: "At Risk", color: "rose", level: "danger" };
}
