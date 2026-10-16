import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import { getAcademicStanding } from '../data/gradeScale';
import { calculateSemesterStats } from '../utils/gpaCalculations';
import { X, Printer, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function PrintSummaryModal() {
  const {
    isPrintSummaryOpen,
    setIsPrintSummaryOpen,
    student,
    semesters,
    stats,
    targetPlan,
    prioritySubjects,
  } = useAcademic();

  if (!isPrintSummaryOpen) return null;

  const standing = getAcademicStanding(stats.cgpa);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsPrintSummaryOpen(false)}>
      <div className="modal-container modal-large print-report-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <div className="modal-title-wrap">
            <GraduationCap className="text-primary" size={24} />
            <div>
              <h3 className="modal-title">Official Academic Audit & CGPA Advisory Report</h3>
              <p className="modal-subtitle">Comprehensive performance summary and advising forecast</p>
            </div>
          </div>
          <div className="flex-center gap-2">
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} /> Print / Save PDF
            </button>
            <button className="btn-icon-xs modal-close-btn" onClick={() => setIsPrintSummaryOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body printable-document">
          {/* Official Letterhead */}
          <div className="report-header">
            <div className="report-brand">
              <h2>SMART CGPA ADVISOR SYSTEM</h2>
              <p className="report-brand-sub">University Academic Performance & Planning Office</p>
            </div>
            <div className="report-meta">
              <div><strong>Date:</strong> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>Status:</strong> {standing.status}</div>
            </div>
          </div>

          <div className="report-divider" />

          {/* Student Identification Info */}
          <div className="report-student-grid">
            <div className="report-student-col">
              <p><strong>Student Name:</strong> {student.name}</p>
              <p><strong>Student ID:</strong> {student.id}</p>
              <p><strong>Degree Program:</strong> {student.program}</p>
            </div>
            <div className="report-student-col">
              <p><strong>Cumulative CGPA:</strong> <span className="report-highlight">{stats.cgpa.toFixed(2)} / 4.00</span></p>
              <p><strong>Completed Credits:</strong> {stats.totalCredits} of {student.degreeTotalCredits} Credit Hours</p>
              <p><strong>Target CGPA:</strong> {student.targetCGPA?.toFixed(2)} (Required Future GPA: {targetPlan.requiredGPA?.toFixed(2)})</p>
            </div>
          </div>

          {/* Semester-by-Semester Transcript Breakdown */}
          <h4 className="report-section-title">Academic Records by Semester</h4>
          {semesters.map((sem) => {
            const semStats = calculateSemesterStats(sem);
            return (
              <div key={sem.id} className="report-semester-card">
                <div className="report-semester-header">
                  <h5>{sem.name} ({sem.term}) {!sem.isCompleted ? '• In Progress' : '• Completed'}</h5>
                  <div className="report-semester-stats">
                    <span>Credits: <strong>{semStats.credits}</strong></span>
                    <span>Term GPA: <strong>{semStats.gpa.toFixed(2)}</strong></span>
                    <span>Quality Points: <strong>{semStats.qualityPoints.toFixed(1)}</strong></span>
                  </div>
                </div>

                <table className="report-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Course Code</th>
                      <th style={{ width: '50%' }}>Course Title</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Credits</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Grade</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.subjects.map((sub) => (
                      <tr key={sub.id}>
                        <td className="font-mono">{sub.code || '—'}</td>
                        <td>{sub.name}</td>
                        <td style={{ textAlign: 'center' }}>{sub.credits}</td>
                        <td style={{ textAlign: 'center' }}><strong>{sub.grade}</strong></td>
                        <td style={{ textAlign: 'right' }}>{(sub.credits * (sub.grade === 'A' ? 4.0 : sub.grade === 'B+' ? 3.33 : sub.grade === 'B' ? 3.0 : sub.grade === 'C' ? 2.0 : 3.0)).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Top Priority Recommendations */}
          <h4 className="report-section-title">Advisory Strategic Action Plan</h4>
          <div className="report-advisory-box">
            <p><strong>Target Feasibility:</strong> {targetPlan.statusBadge} — {targetPlan.guidance}</p>
            <div className="report-priority-list">
              <p><strong>Highest-Yield Leverage Courses to Boost Overall CGPA:</strong></p>
              <ul>
                {prioritySubjects.slice(0, 3).map((sub) => (
                  <li key={sub.id}>
                    <strong>{sub.name}</strong> ({sub.credits} Cr, Current: {sub.grade}) — Potential CGPA gain: <strong>+{sub.potentialCgpaBoost}</strong> (+{sub.qualityPointsGain} Quality Points). {sub.recommendedAction}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="report-footer">
            <p>Generated automatically via Smart CGPA Advisor System • Official Student Demonstration Copy</p>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={() => setIsPrintSummaryOpen(false)}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
