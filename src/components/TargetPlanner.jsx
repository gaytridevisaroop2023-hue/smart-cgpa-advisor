import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { calculateTargetPlan } from '../utils/gpaCalculations';
import {
  Target,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function TargetPlanner() {
  const {
    student,
    stats,
    remainingCredits,
    updateTargetCGPA,
    updateStudent,
  } = useAcademic();

  const [useCustomInputs, setUseCustomInputs] = useState(false);
  const [customCGPA, setCustomCGPA] = useState(stats.cgpa || 3.2);
  const [customCompletedCredits, setCustomCompletedCredits] = useState(stats.totalCredits || 58);
  const [customRemainingCredits, setCustomRemainingCredits] = useState(remainingCredits || 72);
  const [targetVal, setTargetVal] = useState(student.targetCGPA || 3.5);

  const activeCGPA = useCustomInputs ? customCGPA : stats.cgpa;
  const activeCompleted = useCustomInputs ? customCompletedCredits : stats.totalCredits;
  const activeRemaining = useCustomInputs ? customRemainingCredits : remainingCredits;

  const plan = calculateTargetPlan(activeCGPA, activeCompleted, activeRemaining, targetVal);

  const handleUpdateGlobalTarget = (val) => {
    setTargetVal(val);
    updateTargetCGPA(val);
  };

  const getFeasibilityIcon = (feasibility) => {
    switch (feasibility) {
      case 'impossible':
        return <AlertOctagon size={24} className="text-danger" />;
      case 'extreme':
      case 'challenging':
        return <AlertTriangle size={24} className="text-warning" />;
      default:
        return <CheckCircle size={24} className="text-emerald" />;
    }
  };

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Target CGPA Planner</h2>
          <p className="section-subtitle">
            Calculate the exact semester GPA required in future courses to hit your graduation CGPA goal.
          </p>
        </div>

        <div className="section-actions-row">
          <button
            className={`btn btn-sm ${useCustomInputs ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setUseCustomInputs(!useCustomInputs)}
          >
            {useCustomInputs ? 'Using Custom Values' : 'Use Custom Values'}
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="planner-grid">
        {/* Left: Input Configuration */}
        <div className="planner-card">
          <div className="card-header-bar">
            <Target size={18} className="text-primary" />
            <h3 className="card-subheading">Academic Input Parameters</h3>
          </div>

          <div className="planner-form">
            {/* Target CGPA Slider & Input */}
            <div className="form-group">
              <div className="flex-between">
                <label className="form-label font-bold text-accent">
                  Desired Target CGPA
                </label>
                <span className="font-mono font-bold text-lg text-primary">
                  {targetVal.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="2.00"
                max="4.00"
                step="0.05"
                value={targetVal}
                onChange={(e) => handleUpdateGlobalTarget(parseFloat(e.target.value) || 2.0)}
                className="target-slider"
              />
              <div className="slider-ticks">
                <span>2.00 Pass</span>
                <span>2.50</span>
                <span>3.00 Good</span>
                <span>3.50 Honors</span>
                <span>4.00 Max</span>
              </div>
            </div>

            {/* Current CGPA */}
            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Current CGPA</label>
                {!useCustomInputs && <span className="sync-tag">Auto-Synced</span>}
              </div>
              <input
                type="number"
                min="0.00"
                max="4.00"
                step="0.01"
                className="form-input font-mono"
                value={activeCGPA}
                onChange={(e) => setCustomCGPA(parseFloat(e.target.value) || 0)}
                disabled={!useCustomInputs}
              />
            </div>

            {/* Completed Credit Hours */}
            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Completed Credit Hours</label>
                {!useCustomInputs && <span className="sync-tag">Auto-Synced</span>}
              </div>
              <input
                type="number"
                min="0"
                max="180"
                step="1"
                className="form-input font-mono"
                value={activeCompleted}
                onChange={(e) => setCustomCompletedCredits(parseFloat(e.target.value) || 0)}
                disabled={!useCustomInputs}
              />
            </div>

            {/* Remaining Credit Hours */}
            <div className="form-group">
              <div className="flex-between">
                <label className="form-label">Remaining Credit Hours</label>
                {!useCustomInputs && <span className="sync-tag">Auto-Synced</span>}
              </div>
              <input
                type="number"
                min="1"
                max="180"
                step="1"
                className="form-input font-mono"
                value={activeRemaining}
                onChange={(e) => setCustomRemainingCredits(parseFloat(e.target.value) || 1)}
                disabled={!useCustomInputs}
              />
              <span className="form-helper">
                Total Degree: {activeCompleted + activeRemaining} Credit Hours
              </span>
            </div>
          </div>
        </div>

        {/* Right: Analytical Results & Feasibility Engine */}
        <div className="planner-card planner-result-card">
          <div className="card-header-bar">
            <Compass size={18} className="text-primary" />
            <h3 className="card-subheading">Feasibility & Required Performance</h3>
          </div>

          <div className="planner-results-body">
            {/* Required GPA Hero Metric */}
            <div className="required-gpa-hero">
              <span className="required-label">Required Future GPA</span>
              <div className="required-val-row">
                <span className={`required-val font-mono ${plan.feasibility === 'impossible' ? 'text-danger' : 'text-accent'}`}>
                  {plan.requiredGPA <= 0 ? '0.00' : plan.requiredGPA.toFixed(2)}
                </span>
                <span className="required-scale">/ 4.00</span>
              </div>
              <span className="required-sub">
                average needed across all {activeRemaining} remaining credits
              </span>
            </div>

            {/* Feasibility Alert Box */}
            <div className={`feasibility-badge-box bg-${plan.statusColor}-subtle`}>
              <div className="flex-center gap-2">
                {getFeasibilityIcon(plan.feasibility)}
                <span className={`feasibility-title text-${plan.statusColor}`}>
                  {plan.statusBadge}
                </span>
              </div>
              <p className="feasibility-desc">{plan.guidance}</p>
            </div>

            {/* If Impossible or Extreme, Show Max Achievable Bound */}
            <div className="bounds-summary-grid">
              <div className="bound-box">
                <span className="bound-lbl">Highest Achievable CGPA</span>
                <span className="bound-val font-mono text-emerald">
                  {plan.maxAchievableCGPA?.toFixed(2) || '4.00'}
                </span>
                <span className="bound-note">If straight 4.00s earned</span>
              </div>
              <div className="bound-box">
                <span className="bound-lbl">Current Trajectory Floor</span>
                <span className="bound-val font-mono text-secondary">
                  {plan.minAchievableCGPA?.toFixed(2) || '0.00'}
                </span>
                <span className="bound-note">Zero-performance floor</span>
              </div>
            </div>

            {/* Visual Feasibility Range Bar */}
            <div className="feasibility-gauge-section">
              <span className="gauge-title">Feasibility Spectrum:</span>
              <div className="gauge-bar-track">
                <div className="gauge-segment seg-easy" title="Easily Achievable (<=3.0)">Easy</div>
                <div className="gauge-segment seg-moderate" title="Moderate (3.0 - 3.5)">Moderate</div>
                <div className="gauge-segment seg-hard" title="Intense (3.5 - 3.85)">Intense</div>
                <div className="gauge-segment seg-extreme" title="Extreme (3.85 - 4.0)">Max</div>
                <div className="gauge-segment seg-impossible" title="Impossible (>4.0)">Over 4.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Breakdown Roadmap */}
      {plan.semesterBreakdown && plan.semesterBreakdown.length > 0 && (
        <div className="roadmap-container">
          <div className="roadmap-header">
            <h4>
              <Calendar size={18} className="text-primary" />
              <span>Future Semesters Milestone Roadmap ({plan.remainingSemestersCount} Terms Projected)</span>
            </h4>
            <span className="roadmap-hint">
              Target term GPA required in each future semester to stay on pace
            </span>
          </div>

          <div className="roadmap-cards-grid">
            {plan.semesterBreakdown.map((sem) => (
              <div key={sem.semesterIndex} className="roadmap-sem-card">
                <div className="roadmap-sem-top">
                  <span className="roadmap-sem-name">{sem.name}</span>
                  <span className="roadmap-sem-credits">{sem.credits} Credits</span>
                </div>
                <div className="roadmap-sem-target">
                  <span className="target-term-label">Target Term GPA</span>
                  <span className="target-term-val font-mono">
                    {sem.requiredTermGPA.toFixed(2)}
                  </span>
                </div>
                <div className="roadmap-sem-sample">
                  <span className="sample-label">Sample Grade Mix:</span>
                  <span className="sample-text">
                    {sem.requiredTermGPA >= 3.8 
                      ? "Straight A's (4.0)" 
                      : sem.requiredTermGPA >= 3.4 
                      ? "3 A's & 2 B+'s" 
                      : sem.requiredTermGPA >= 3.0 
                      ? "Mix of B's and B+'s" 
                      : "Satisfactory C's & B's"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
