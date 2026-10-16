import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { getAcademicStanding } from '../data/gradeScale';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Target,
  Percent,
  TrendingUp,
  TrendingDown,
  Edit2,
  Check,
  Sparkles,
} from 'lucide-react';

export default function MetricCards() {
  const {
    student,
    stats,
    whatIfStats,
    simulatedGrades,
    remainingCredits,
    targetPlan,
    updateTargetCGPA,
    setActiveTab,
    setIsEditCgpaModalOpen,
  } = useAcademic();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(student.targetCGPA || 3.5);

  const hasSimulation = Object.keys(simulatedGrades).length > 0;
  const activeCGPA = hasSimulation ? whatIfStats.simulatedCGPA : stats.cgpa;
  const cgpaDelta = parseFloat((activeCGPA - stats.cgpa).toFixed(2));

  const standing = getAcademicStanding(activeCGPA);
  const totalDegreeCredits = student.degreeTotalCredits || 130;
  const progressPercent = Math.min(100, Math.max(0, ((stats.totalCredits / totalDegreeCredits) * 100))).toFixed(1);

  const targetDiff = parseFloat((student.targetCGPA - activeCGPA).toFixed(2));

  const handleSaveTarget = () => {
    updateTargetCGPA(targetInput);
    setIsEditingTarget(false);
  };

  return (
    <div className="metrics-grid">
      {/* 1. Current CGPA */}
      <div className="metric-card metric-card-cgpa">
        <div className="metric-header">
          <span className="metric-title">Cumulative CGPA</span>
          <div className="flex-center gap-1">
            <button
              className="btn-icon-xs text-muted hover-icon"
              onClick={() => setIsEditCgpaModalOpen(true)}
              title="Edit Cumulative CGPA / Set prior standing"
            >
              <Edit2 size={13} />
            </button>
            <div className={`metric-icon-wrap bg-${standing.color}-subtle`}>
              <Award className={`text-${standing.color}`} size={20} />
            </div>
          </div>
        </div>

        <div className="metric-body">
          <div className="metric-value-row">
            <span className="metric-huge-value">{activeCGPA.toFixed(2)}</span>
            <span className="metric-scale-max">/ 4.00</span>
            {hasSimulation && (
              <span className={`delta-badge ${cgpaDelta >= 0 ? 'positive' : 'negative'}`}>
                {cgpaDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {cgpaDelta >= 0 ? `+${cgpaDelta.toFixed(2)}` : cgpaDelta.toFixed(2)}
              </span>
            )}
          </div>

          <div className="metric-footer-row">
            <span className={`standing-pill standing-${standing.color}`}>
              {standing.status}
            </span>
            <button
              className="link-btn"
              onClick={() => setIsEditCgpaModalOpen(true)}
              title="Click to edit or set your overall CGPA"
            >
              Edit CGPA
            </button>
          </div>
        </div>
      </div>

      {/* 2. Semester GPA */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-title">Current Semester GPA</span>
          <div className="metric-icon-wrap bg-blue-subtle">
            <BookOpen className="text-blue" size={20} />
          </div>
        </div>

        <div className="metric-body">
          <div className="metric-value-row">
            <span className="metric-huge-value">{stats.currentSemesterGPA.toFixed(2)}</span>
            <span className="metric-scale-max">/ 4.00</span>
          </div>

          <div className="metric-footer-row">
            <span className="info-chip">
              {stats.currentSemesterCredits} Enrolled Credits
            </span>
            <span className="metric-subtext">
              {stats.currentSemesterGPA >= stats.cgpa ? (
                <span className="text-emerald flex-center gap-1">
                  <TrendingUp size={13} /> Above Avg
                </span>
              ) : (
                <span className="text-amber flex-center gap-1">
                  <TrendingDown size={13} /> Below Avg
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Completed Credit Hours */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-title">Completed Credit Hours</span>
          <div className="metric-icon-wrap bg-indigo-subtle">
            <CheckCircle2 className="text-indigo" size={20} />
          </div>
        </div>

        <div className="metric-body">
          <div className="metric-value-row">
            <span className="metric-huge-value">{stats.totalCredits}</span>
            <span className="metric-scale-max">/ {totalDegreeCredits} Cr</span>
          </div>

          <div className="metric-footer-row">
            <span className="info-chip">
              {remainingCredits} Credits Remaining
            </span>
            <button
              className="link-btn"
              onClick={() => setActiveTab('calculator')}
            >
              Manage Courses
            </button>
          </div>
        </div>
      </div>

      {/* 4. Target CGPA */}
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-title">Target CGPA</span>
          <div className="metric-icon-wrap bg-purple-subtle">
            <Target className="text-purple" size={20} />
          </div>
        </div>

        <div className="metric-body">
          <div className="metric-value-row">
            {isEditingTarget ? (
              <div className="edit-target-form">
                <input
                  type="number"
                  min="1.0"
                  max="4.0"
                  step="0.05"
                  className="target-input-field"
                  value={targetInput}
                  onChange={(e) => setTargetInput(parseFloat(e.target.value) || 0)}
                  autoFocus
                />
                <button
                  className="btn-icon-xs btn-primary"
                  onClick={handleSaveTarget}
                  title="Save target"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <>
                <span className="metric-huge-value">{student.targetCGPA?.toFixed(2) || '3.50'}</span>
                <span className="metric-scale-max">Goal</span>
                <button
                  className="btn-icon-xs text-muted hover-icon"
                  onClick={() => {
                    setTargetInput(student.targetCGPA || 3.5);
                    setIsEditingTarget(true);
                  }}
                  title="Edit target CGPA"
                >
                  <Edit2 size={13} />
                </button>
              </>
            )}
          </div>

          <div className="metric-footer-row">
            {targetDiff <= 0 ? (
              <span className="standing-pill standing-emerald">
                🎉 Goal Achieved!
              </span>
            ) : (
              <span className="info-chip text-purple">
                Need +{targetDiff.toFixed(2)} to reach
              </span>
            )}
            <button
              className="link-btn"
              onClick={() => setActiveTab('target')}
            >
              Plan Strategy
            </button>
          </div>
        </div>
      </div>

      {/* 5. Academic Degree Progress */}
      <div className="metric-card metric-card-progress">
        <div className="metric-header">
          <span className="metric-title">Academic Progress</span>
          <div className="metric-icon-wrap bg-teal-subtle">
            <Percent className="text-teal" size={20} />
          </div>
        </div>

        <div className="metric-body">
          <div className="progress-stat-row">
            <span className="metric-huge-value">{progressPercent}%</span>
            <span className="metric-subtext">Degree Completed</span>
          </div>

          <div className="academic-progress-bar-bg">
            <div
              className="academic-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="metric-footer-row">
            <span className="metric-micro-text">
              {stats.totalCredits} of {totalDegreeCredits} credits fulfilled
            </span>
            <span className="level-badge">
              {progressPercent >= 75 ? 'Senior' : progressPercent >= 50 ? 'Junior' : progressPercent >= 25 ? 'Sophomore' : 'Freshman'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
