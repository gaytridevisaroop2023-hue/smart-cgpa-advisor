import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  Zap,
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function SubjectPriority() {
  const {
    prioritySubjects,
    setSimulatedGrade,
    setActiveTab,
    showToast,
  } = useAcademic();

  const [filterPriority, setFilterPriority] = useState('ALL');
  const [sortBy, setSortBy] = useState('IMPACT');

  const highCount = prioritySubjects.filter(s => s.priority === 'HIGH').length;
  const medCount = prioritySubjects.filter(s => s.priority === 'MEDIUM').length;
  const lowCount = prioritySubjects.filter(s => s.priority === 'LOW').length;

  const filtered = prioritySubjects.filter(sub => {
    if (filterPriority === 'ALL') return true;
    return sub.priority === filterPriority;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'IMPACT') return b.qualityPointsGain - a.qualityPointsGain;
    if (sortBy === 'CREDITS') return b.credits - a.credits;
    if (sortBy === 'NAME') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleSimulateBoost = (sub) => {
    setSimulatedGrade(sub.id, 'A');
    showToast(`Simulated "${sub.name}" boosted to Grade 'A'`, 'success');
    setActiveTab('whatif');
  };

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <div className="flex-center gap-2">
            <h2 className="section-title">Smart Subject Priority Engine</h2>
            <span className="badge-highlight">
              <Zap size={13} /> Algorithm-Backed
            </span>
          </div>
          <p className="section-subtitle">
            Analyzes your course portfolio by credit weight and current grade to identify where study effort or retakes yield the maximum CGPA gain.
          </p>
        </div>
      </div>

      {/* Priority Summary Cards */}
      <div className="priority-overview-grid">
        <div className="priority-stat-card card-high">
          <div className="priority-stat-top">
            <span className="priority-pill pill-high">🔴 High Priority</span>
            <span className="priority-stat-num">{highCount}</span>
          </div>
          <p className="priority-stat-desc">
            Heavy credit load (3-4 Cr) with low/average grades. Highest leverage for CGPA recovery.
          </p>
        </div>

        <div className="priority-stat-card card-medium">
          <div className="priority-stat-top">
            <span className="priority-pill pill-medium">🟡 Medium Priority</span>
            <span className="priority-stat-num">{medCount}</span>
          </div>
          <p className="priority-stat-desc">
            Moderate credits or grades in the B/B- tier. Solid secondary targets for honors push.
          </p>
        </div>

        <div className="priority-stat-card card-low">
          <div className="priority-stat-top">
            <span className="priority-pill pill-low">🟢 Low Priority</span>
            <span className="priority-stat-num">{lowCount}</span>
          </div>
          <p className="priority-stat-desc">
            Already mastered at 'A' or low credit load (1 Cr lab). Minimal CGPA headroom.
          </p>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="priority-filter-bar">
        <div className="filter-buttons-group">
          <span className="filter-label">Filter:</span>
          <button
            className={`btn-filter ${filterPriority === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterPriority('ALL')}
          >
            All Courses ({prioritySubjects.length})
          </button>
          <button
            className={`btn-filter filter-high ${filterPriority === 'HIGH' ? 'active' : ''}`}
            onClick={() => setFilterPriority('HIGH')}
          >
            High Priority ({highCount})
          </button>
          <button
            className={`btn-filter filter-med ${filterPriority === 'MEDIUM' ? 'active' : ''}`}
            onClick={() => setFilterPriority('MEDIUM')}
          >
            Medium ({medCount})
          </button>
          <button
            className={`btn-filter filter-low ${filterPriority === 'LOW' ? 'active' : ''}`}
            onClick={() => setFilterPriority('LOW')}
          >
            Low ({lowCount})
          </button>
        </div>

        <div className="sort-group">
          <label className="text-muted text-sm">Sort By:</label>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="IMPACT">Highest CGPA Gain</option>
            <option value="CREDITS">Credit Hours (High to Low)</option>
            <option value="NAME">Subject Name</option>
          </select>
        </div>
      </div>

      {/* Priority Cards List */}
      <div className="priority-cards-list">
        {sorted.map((item) => {
          return (
            <div key={item.id} className={`priority-subject-card border-${item.priority.toLowerCase()}`}>
              <div className="pri-card-main">
                <div className="pri-meta-header">
                  <span className={`pri-badge badge-${item.priority.toLowerCase()}`}>
                    {item.priority === 'HIGH' ? '🔴 HIGH PRIORITY' : item.priority === 'MEDIUM' ? '🟡 MEDIUM PRIORITY' : '🟢 LOW PRIORITY'}
                  </span>
                  <span className="pri-semester-tag">{item.semesterName}</span>
                </div>

                <div className="pri-title-row">
                  <h3 className="pri-subject-name">
                    {item.name}
                    <span className="pri-code font-mono">({item.code || 'CORE'})</span>
                  </h3>
                  <div className="pri-grades-box">
                    <span className="pri-credit-pill">{item.credits} Credit Hours</span>
                    <span className="pri-grade-pill">Grade: <strong>{item.grade}</strong> ({item.gradePoints.toFixed(2)} pts)</span>
                  </div>
                </div>

                {/* Explanation / Rationale */}
                <div className="pri-rationale-box">
                  <p className="pri-rationale-text">
                    <strong>Why this priority?</strong> {item.rationale}
                  </p>
                  <p className="pri-action-text">
                    <strong>Recommended Action:</strong> {item.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Right Impact Metric & Action */}
              <div className="pri-card-impact">
                <div className="pri-gain-metric">
                  <span className="pri-gain-lbl">Potential CGPA Boost</span>
                  <span className="pri-gain-val font-mono text-emerald">
                    +{item.potentialCgpaBoost.toFixed(3)}
                  </span>
                  <span className="pri-gain-sub">
                    +{item.qualityPointsGain} Quality Points available
                  </span>
                </div>

                {item.qualityPointsGain > 0 ? (
                  <button
                    className="btn btn-secondary btn-sm pri-simulate-btn"
                    onClick={() => handleSimulateBoost(item)}
                    title="Simulate boosting this course in What-If Simulator"
                  >
                    <Sliders size={13} />
                    <span>Simulate Boost</span>
                  </button>
                ) : (
                  <span className="optimized-tag">
                    <CheckCircle2 size={13} className="text-emerald" /> Fully Optimized
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
