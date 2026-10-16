import React, { useState, useEffect } from 'react';
import { useAcademic } from '../context/AcademicContext';
import MetricCards from '../components/MetricCards';
import RiskAlertBanner from '../components/RiskAlertBanner';
import { calculateSemesterStats } from '../utils/gpaCalculations';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Target,
  Sliders,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  BotMessageSquare,
  Award,
  Edit2,
  Check,
  X,
  User,
} from 'lucide-react';

export default function DashboardView() {
  const {
    student,
    updateStudent,
    setIsProfileModalOpen,
    semesters,
    stats,
    targetPlan,
    prioritySubjects,
    scenarios,
    setActiveTab,
    setEditingSubject,
    simulatedGrades,
    whatIfStats,
  } = useAcademic();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(student.name || '');

  useEffect(() => {
    setNameInput(student.name || '');
  }, [student.name]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateStudent({ name: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const currentSemester = semesters.find(s => !s.isCompleted) || semesters[semesters.length - 1];
  const currentSemesterStats = calculateSemesterStats(currentSemester);
  const highPriorityList = prioritySubjects.filter(s => s.priority === 'HIGH').slice(0, 3);
  const hasSimulation = Object.keys(simulatedGrades).length > 0;

  return (
    <div className="dashboard-view-content">
      {/* Student Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-info-col">
          <div className="welcome-badge">
            <Sparkles size={13} className="text-accent" />
            <span>Academic Performance Command Center</span>
          </div>
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="inline-name-form">
              <span className="welcome-prefix">Welcome back,</span>
              <input
                type="text"
                className="inline-name-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                required
              />
              <div className="flex-center gap-1">
                <button type="submit" className="btn-icon-xs btn-primary" title="Save name">
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon-xs btn-secondary"
                  onClick={() => {
                    setNameInput(student.name || '');
                    setIsEditingName(false);
                  }}
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            </form>
          ) : (
            <div className="welcome-title-row">
              <h2 className="welcome-title">
                Welcome back, <span className="welcome-student-name">{student.name}</span>!
              </h2>
              <button
                className="btn-edit-name-inline"
                onClick={() => setIsEditingName(true)}
                title="Click to enter or change your name"
              >
                <Edit2 size={14} />
                <span>Change Name</span>
              </button>
            </div>
          )}

          <div className="welcome-subtitle-row">
            <p className="welcome-subtitle">
              {student.program} • Semester {student.currentSemesterNumber} ({currentSemester?.term || 'Spring 2026'})
            </p>
            <button
              className="link-subtle"
              onClick={() => setIsProfileModalOpen(true)}
              title="Edit degree program, student ID, and target"
            >
              • Edit Profile & Degree
            </button>
          </div>
        </div>

        <div className="welcome-actions-col">
          <button
            className="btn btn-primary"
            onClick={() => setActiveTab('whatif')}
          >
            <Sliders size={16} />
            <span>What-If Sandbox</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setActiveTab('target')}
          >
            <Target size={16} />
            <span>Target Plan</span>
          </button>
        </div>
      </div>

      {/* Real-time Risk Alert Banner */}
      <RiskAlertBanner />

      {/* Core KPI Metrics Grid */}
      <MetricCards />

      {/* Two-Column Strategic Dashboard Insights */}
      <div className="dashboard-insights-grid">
        {/* Left Column: Active Semester & Trajectory */}
        <div className="insights-column">
          {/* Active Semester Course Snapshot */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="flex-center gap-2">
                <Calendar size={18} className="text-primary" />
                <h3 className="dash-card-title">
                  Current Term: {currentSemester?.name || 'Active Semester'}
                </h3>
              </div>
              <button
                className="card-header-link"
                onClick={() => setActiveTab('calculator')}
              >
                <span>Full Calculator</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="term-quick-stats">
              <div className="t-stat">
                <span className="t-stat-lbl">Term GPA</span>
                <span className="t-stat-val font-mono text-primary">
                  {currentSemesterStats.gpa.toFixed(2)}
                </span>
              </div>
              <div className="t-stat">
                <span className="t-stat-lbl">Enrolled Credits</span>
                <span className="t-stat-val font-mono">
                  {currentSemesterStats.credits} hrs
                </span>
              </div>
              <div className="t-stat">
                <span className="t-stat-lbl">Courses Count</span>
                <span className="t-stat-val font-mono">
                  {currentSemester?.subjects.length || 0}
                </span>
              </div>
            </div>

            <div className="courses-mini-list">
              {currentSemester?.subjects.map((sub) => (
                <div key={sub.id} className="course-mini-item">
                  <div className="mini-item-meta">
                    <span className="mini-code font-mono">{sub.code || 'CORE'}</span>
                    <span className="mini-name">{sub.name}</span>
                  </div>
                  <div className="mini-item-stats">
                    <span className="mini-cred">{sub.credits} Cr</span>
                    <span className={`grade-chip grade-${sub.grade.replace('+', 'plus').replace('-', 'minus')}`}>
                      {sub.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="dash-card-footer">
              <button
                className="btn btn-secondary btn-sm btn-block"
                onClick={() => setEditingSubject({ semesterId: currentSemester?.id, subject: null })}
              >
                + Add Another Course to Term
              </button>
            </div>
          </div>

          {/* CGPA Journey Trajectory Preview Card */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="flex-center gap-2">
                <TrendingUp size={18} className="text-emerald" />
                <h3 className="dash-card-title">CGPA Trajectory Journey</h3>
              </div>
              <button
                className="card-header-link"
                onClick={() => setActiveTab('journey')}
              >
                <span>Interactive Chart</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="journey-milestones-row">
              {semesters.map((s, idx) => {
                const sStat = calculateSemesterStats(s);
                return (
                  <div key={s.id} className="journey-node-item">
                    <div className="node-marker">
                      <span className="node-number">{idx + 1}</span>
                    </div>
                    <span className="node-sem-name">{s.name.replace('Semester ', 'Sem ')}</span>
                    <span className="node-gpa font-mono">{sStat.gpa.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="journey-status-bar">
              <span className="text-secondary text-sm">
                Started at <strong>2.65</strong> in Sem 1 → Rising to <strong>{stats.cgpa.toFixed(2)}</strong> current standing.
              </span>
              <button
                className="btn btn-outline-primary btn-xs"
                onClick={() => setActiveTab('journey')}
              >
                View Curve
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Strategic Prioritization & Target Roadmap */}
        <div className="insights-column">
          {/* Smart Subject Priority Top Recommendations */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="flex-center gap-2">
                <Zap size={18} className="text-accent" />
                <h3 className="dash-card-title">High Priority Improvement Targets</h3>
              </div>
              <button
                className="card-header-link"
                onClick={() => setActiveTab('priority')}
              >
                <span>All Rankings</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <p className="card-guidance-text">
              Courses carrying heavy credit weights with room for GPA recovery:
            </p>

            <div className="priority-mini-list">
              {highPriorityList.length === 0 ? (
                <div className="no-high-priority">
                  <ShieldCheck size={28} className="text-emerald" />
                  <p>No high-priority grade deficiencies detected! Your core courses are in good standing.</p>
                </div>
              ) : (
                highPriorityList.map((item) => (
                  <div key={item.id} className="priority-mini-card">
                    <div className="pri-mini-top">
                      <span className="pri-tag-danger">HIGH PRIORITY</span>
                      <span className="pri-boost-tag">
                        +{item.potentialCgpaBoost} CGPA Boost
                      </span>
                    </div>
                    <h4 className="pri-mini-title">{item.name}</h4>
                    <p className="pri-mini-detail">
                      <strong>{item.credits} Credit Hours</strong> • Current Grade: <strong>{item.grade}</strong> ({item.gradePoints.toFixed(2)} pts).
                    </p>
                    <p className="pri-mini-rationale">
                      Upgrading to an 'A' recovers +{item.qualityPointsGain} Quality Points.
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="dash-card-footer">
              <button
                className="btn btn-secondary btn-sm btn-block"
                onClick={() => setActiveTab('priority')}
              >
                Explore Full Priority Analysis & Strategies
              </button>
            </div>
          </div>

          {/* Scenario Quick Glance Card */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="flex-center gap-2">
                <Sliders size={18} className="text-indigo" />
                <h3 className="dash-card-title">Scenario Forecast Range</h3>
              </div>
              <button
                className="card-header-link"
                onClick={() => setActiveTab('scenarios')}
              >
                <span>Details</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="scenarios-compact-row">
              <div className="compact-scenario-box c-worst">
                <span className="c-lbl">Worst Case</span>
                <span className="c-val font-mono">{scenarios.worst.projectedCGPA.toFixed(2)}</span>
                <span className="c-sub">2.00 Term</span>
              </div>
              <div className="compact-scenario-box c-exp">
                <span className="c-lbl">Expected</span>
                <span className="c-val font-mono">{scenarios.expected.projectedCGPA.toFixed(2)}</span>
                <span className="c-sub">Current Pace</span>
              </div>
              <div className="compact-scenario-box c-best">
                <span className="c-lbl">Best Case</span>
                <span className="c-val font-mono">{scenarios.best.projectedCGPA.toFixed(2)}</span>
                <span className="c-sub">4.00 Term</span>
              </div>
            </div>

            {/* Quick Advisor Callout */}
            <div className="advisor-callout-card">
              <div className="flex-center gap-2">
                <BotMessageSquare size={20} className="text-primary flex-shrink-0" />
                <div className="callout-text">
                  <p className="callout-title">Have a specific target in mind?</p>
                  <p className="callout-desc">
                    Ask Advisor Alex: <em>"My CGPA is {stats.cgpa.toFixed(2)} and I want {student.targetCGPA?.toFixed(2)}. What should I focus on?"</em>
                  </p>
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm btn-full-mobile"
                onClick={() => setActiveTab('advisor')}
              >
                <span>Ask Advisor</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
