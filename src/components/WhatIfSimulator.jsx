import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import { GRADE_SCALE, getGradePoints } from '../data/gradeScale';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';

export default function WhatIfSimulator() {
  const {
    semesters,
    stats,
    simulatedGrades,
    setSimulatedGrade,
    resetSimulatedGrades,
    applySimulatedGrades,
    whatIfStats,
  } = useAcademic();

  const currentCGPA = stats.cgpa;
  const simulatedCGPA = whatIfStats.simulatedCGPA;
  const delta = parseFloat((simulatedCGPA - currentCGPA).toFixed(2));
  const hasChanges = Object.keys(simulatedGrades).length > 0;

  // Gather current semester subjects or all active subjects
  const currentSemester = semesters.find(s => !s.isCompleted) || semesters[semesters.length - 1];

  // Preset triggers
  const handlePresetAllA = () => {
    if (!currentSemester) return;
    currentSemester.subjects.forEach(sub => {
      setSimulatedGrade(sub.id, 'A');
    });
  };

  const handlePresetAllBPlus = () => {
    if (!currentSemester) return;
    currentSemester.subjects.forEach(sub => {
      setSimulatedGrade(sub.id, 'B+');
    });
  };

  const handlePresetBoostLowest = () => {
    if (!currentSemester || currentSemester.subjects.length === 0) return;
    // Find subject with lowest grade points
    let lowestSub = currentSemester.subjects[0];
    let minPts = 5.0;
    currentSemester.subjects.forEach(sub => {
      const pts = getGradePoints(sub.grade);
      if (pts < minPts) {
        minPts = pts;
        lowestSub = sub;
      }
    });
    setSimulatedGrade(lowestSub.id, 'A');
  };

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <div className="flex-center gap-2">
            <h2 className="section-title">What-If Grade Simulator</h2>
            <span className="badge-live-sandbox">
              <Sparkles size={12} /> Interactive Sandbox
            </span>
          </div>
          <p className="section-subtitle">
            Simulate alternative letter grades to immediately see how individual course changes impact your cumulative CGPA.
          </p>
        </div>

        <div className="section-actions-row">
          {hasChanges && (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={resetSimulatedGrades}
                title="Discard simulated grades"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={applySimulatedGrades}
                title="Save simulated grades to your records"
              >
                <CheckCircle2 size={14} /> Apply to Records
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Simulation Comparison Bar */}
      <div className="simulation-hero-card">
        <div className="simulation-metric-box">
          <span className="sim-label">Current Actual CGPA</span>
          <span className="sim-val font-mono">{currentCGPA.toFixed(2)}</span>
          <span className="sim-sub">Based on verified grades</span>
        </div>

        <div className="sim-arrow-divider">
          <ArrowRight size={28} className="arrow-glow" />
        </div>

        <div className="simulation-metric-box projected-box">
          <span className="sim-label">Simulated Projected CGPA</span>
          <span className="sim-val text-accent font-mono">{simulatedCGPA.toFixed(2)}</span>
          <span className="sim-sub">
            {hasChanges ? `${whatIfStats.changedSubjects.length} courses modified` : 'No grade changes yet'}
          </span>
        </div>

        <div className="simulation-delta-box">
          <span className="sim-label">Projected Impact</span>
          <div className={`sim-delta-pill ${delta > 0 ? 'delta-positive' : delta < 0 ? 'delta-negative' : 'delta-neutral'}`}>
            {delta > 0 ? <TrendingUp size={16} /> : delta < 0 ? <TrendingDown size={16} /> : null}
            <span>{delta > 0 ? `+${delta.toFixed(2)} CGPA` : `${delta.toFixed(2)} CGPA`}</span>
          </div>
          <span className="sim-sub">
            {delta > 0 ? 'Academic Gain' : delta < 0 ? 'Academic Loss' : 'Neutral Standing'}
          </span>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="sim-presets-bar">
        <span className="presets-label">Quick Scenarios:</span>
        <button className="btn-preset" onClick={handlePresetAllA}>
          🌟 What if all A's (4.00)?
        </button>
        <button className="btn-preset" onClick={handlePresetAllBPlus}>
          ⭐ What if all B+'s (3.33)?
        </button>
        <button className="btn-preset" onClick={handlePresetBoostLowest}>
          🚀 What if I boost lowest course to A?
        </button>
        {hasChanges && (
          <button className="btn-preset preset-reset" onClick={resetSimulatedGrades}>
            <RotateCcw size={12} /> Clear Simulation
          </button>
        )}
      </div>

      {/* Interactive Course Simulation Cards */}
      <div className="simulator-grid">
        <div className="sim-courses-panel">
          <div className="panel-title-bar">
            <h4>
              <Layers size={16} className="text-primary" />
              <span>Simulate Course Grades ({currentSemester?.name || 'Current Term'})</span>
            </h4>
            <span className="panel-hint">Select a new grade for any course below:</span>
          </div>

          <div className="sim-courses-list">
            {currentSemester?.subjects.map((sub) => {
              const currentGrade = sub.grade;
              const activeSimGrade = simulatedGrades[sub.id] || currentGrade;
              const isChanged = Boolean(simulatedGrades[sub.id] && simulatedGrades[sub.id] !== currentGrade);
              const origPts = getGradePoints(currentGrade);
              const simPts = getGradePoints(activeSimGrade);
              const ptsDiff = (simPts - origPts) * sub.credits;

              return (
                <div key={sub.id} className={`sim-course-card ${isChanged ? 'card-modified' : ''}`}>
                  <div className="sim-card-top">
                    <div>
                      <div className="flex-center gap-2">
                        <span className="sim-course-code">{sub.code || 'CORE'}</span>
                        <span className="sim-credit-tag">{sub.credits} Credit Hours</span>
                      </div>
                      <h4 className="sim-course-name">{sub.name}</h4>
                    </div>

                    <div className="sim-status-indicator">
                      {isChanged ? (
                        <span className={`sim-change-badge ${ptsDiff >= 0 ? 'bg-positive' : 'bg-negative'}`}>
                          {ptsDiff >= 0 ? `+${ptsDiff.toFixed(2)} pts` : `${ptsDiff.toFixed(2)} pts`}
                        </span>
                      ) : (
                        <span className="sim-current-grade-tag">Actual: {currentGrade}</span>
                      )}
                    </div>
                  </div>

                  <div className="sim-card-bottom">
                    <span className="grade-selector-label">Change Grade:</span>
                    <div className="grade-selector-buttons">
                      {GRADE_SCALE.map((g) => {
                        const isSelected = activeSimGrade === g.grade;
                        const isOriginal = currentGrade === g.grade;

                        return (
                          <button
                            key={g.grade}
                            type="button"
                            className={`grade-button ${isSelected ? 'selected' : ''} ${isOriginal && !isSelected ? 'is-original' : ''}`}
                            onClick={() => setSimulatedGrade(sub.id, g.grade)}
                            title={`${g.grade}: ${g.points.toFixed(2)} pts (${g.percentage})`}
                          >
                            {g.grade}
                            {isOriginal && <span className="orig-dot" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Changed Courses Summary & Real-Time Impact */}
        <div className="sim-summary-panel">
          <div className="panel-title-bar">
            <h4>Impact Breakdown</h4>
          </div>

          {whatIfStats.changedSubjects.length === 0 ? (
            <div className="sim-empty-changes">
              <Info size={32} className="text-muted" />
              <p className="empty-sub">No grades currently modified in simulation</p>
              <p className="empty-micro">Click any grade button on the left to see instant CGPA impact.</p>
            </div>
          ) : (
            <div className="sim-impact-table-wrap">
              <div className="impact-stats-card">
                <div className="impact-stat-item">
                  <span className="impact-lbl">Total Modified Courses</span>
                  <span className="impact-val">{whatIfStats.changedSubjects.length}</span>
                </div>
                <div className="impact-stat-item">
                  <span className="impact-lbl">Net Quality Points Shift</span>
                  <span className={`impact-val font-mono ${delta >= 0 ? 'text-emerald' : 'text-danger'}`}>
                    {(whatIfStats.simulatedQualityPoints - stats.totalQualityPoints).toFixed(1)} pts
                  </span>
                </div>
              </div>

              <div className="sim-items-list">
                {whatIfStats.changedSubjects.map((item) => (
                  <div key={item.id} className="sim-impact-row">
                    <div className="impact-course-meta">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-muted text-xs">({item.credits} Cr)</span>
                    </div>
                    <div className="impact-grade-transition">
                      <span className="grade-orig">{item.originalGrade}</span>
                      <ArrowRight size={12} />
                      <span className="grade-new">{item.simulatedGrade}</span>
                    </div>
                    <div className={`impact-pts font-mono font-bold ${item.pointsDiff >= 0 ? 'text-emerald' : 'text-danger'}`}>
                      {item.pointsDiff >= 0 ? `+${item.pointsDiff.toFixed(1)}` : `${item.pointsDiff.toFixed(1)}`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sim-action-banner">
                <p>Happy with this simulation? You can lock these grades into your records:</p>
                <button className="btn btn-primary btn-block" onClick={applySimulatedGrades}>
                  <CheckCircle2 size={16} /> Apply Simulation Permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
