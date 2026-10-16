import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { calculateScenarios } from '../utils/gpaCalculations';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Sliders,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function ScenarioPredictor() {
  const { semesters, stats } = useAcademic();

  const [customExpected, setCustomExpected] = useState(
    stats.currentSemesterGPA > 0 ? stats.currentSemesterGPA : 3.20
  );

  const scenarioData = calculateScenarios(semesters, customExpected);

  const best = scenarioData.best;
  const expected = scenarioData.expected;
  const worst = scenarioData.worst;

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Best / Expected / Worst Case Predictor</h2>
          <p className="section-subtitle">
            Simulate upper, probable, and lower bound academic trajectories for your current {scenarioData.termCredits}-credit load.
          </p>
        </div>
      </div>

      {/* Visual Range Spread Banner */}
      <div className="scenario-spectrum-card">
        <div className="spectrum-header">
          <span className="spectrum-title">Cumulative CGPA Spread Range</span>
          <span className="spectrum-spread-val font-mono">
            Variance: ±{((scenarioData.spread) / 2).toFixed(2)} CGPA points ({worst.projectedCGPA.toFixed(2)} to {best.projectedCGPA.toFixed(2)})
          </span>
        </div>

        <div className="visual-spread-bar">
          <div className="spread-zone worst-zone">
            <span className="zone-label">Worst: {worst.projectedCGPA.toFixed(2)}</span>
          </div>
          <div className="spread-zone exp-zone">
            <span className="zone-label">Expected: {expected.projectedCGPA.toFixed(2)}</span>
          </div>
          <div className="spread-zone best-zone">
            <span className="zone-label">Best: {best.projectedCGPA.toFixed(2)}</span>
          </div>
        </div>

        <div className="current-anchor-row">
          <span>Current Base: <strong>{stats.cgpa.toFixed(2)} CGPA</strong></span>
          <span className="text-muted text-xs">Based on {scenarioData.termCredits} enrolled term credits</span>
        </div>
      </div>

      {/* 3 Scenario Cards */}
      <div className="scenarios-grid">
        {/* 1. Best Case */}
        <div className="scenario-card scenario-best">
          <div className="scenario-card-header">
            <div className="scenario-icon-wrap bg-emerald-subtle">
              <Zap className="text-emerald" size={22} />
            </div>
            <div>
              <span className="scenario-badge badge-emerald">OPTIMISTIC UPPER BOUND</span>
              <h3 className="scenario-name">Best Case Scenario</h3>
            </div>
          </div>

          <div className="scenario-body">
            <div className="scenario-metric-row">
              <div className="scenario-term-metric">
                <span className="scenario-lbl">Semester Term GPA</span>
                <span className="scenario-val text-emerald font-mono">4.00</span>
              </div>
              <div className="scenario-term-metric">
                <span className="scenario-lbl">Projected Degree CGPA</span>
                <span className="scenario-huge-val text-emerald font-mono">
                  {best.projectedCGPA.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="scenario-description">
              Assumes straight A's (4.00) in all {scenarioData.termCredits} enrolled credits.
            </p>

            <div className="scenario-delta-box bg-emerald-subtle">
              <span className="font-bold text-emerald">
                +{((best.projectedCGPA - stats.cgpa)).toFixed(2)} CGPA Jump
              </span>
              <span className="text-xs text-muted">Maximum possible semester surge</span>
            </div>
          </div>
        </div>

        {/* 2. Expected Case */}
        <div className="scenario-card scenario-expected">
          <div className="scenario-card-header">
            <div className="scenario-icon-wrap bg-indigo-subtle">
              <Sparkles className="text-indigo" size={22} />
            </div>
            <div>
              <span className="scenario-badge badge-indigo">REALISTIC FORECAST</span>
              <h3 className="scenario-name">Expected Case Scenario</h3>
            </div>
          </div>

          <div className="scenario-body">
            <div className="scenario-metric-row">
              <div className="scenario-term-metric">
                <span className="scenario-lbl">Semester Term GPA</span>
                <span className="scenario-val text-indigo font-mono">
                  {expected.termGPA.toFixed(2)}
                </span>
              </div>
              <div className="scenario-term-metric">
                <span className="scenario-lbl">Projected Degree CGPA</span>
                <span className="scenario-huge-val text-indigo font-mono">
                  {expected.projectedCGPA.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="scenario-description">
              {expected.description}
            </p>

            <div className="scenario-delta-box bg-indigo-subtle">
              <span className="font-bold text-indigo">
                {expected.projectedCGPA >= stats.cgpa
                  ? `+${(expected.projectedCGPA - stats.cgpa).toFixed(2)} Growth`
                  : `${(expected.projectedCGPA - stats.cgpa).toFixed(2)} Dip`}
              </span>
              <span className="text-xs text-muted">Most probable outcome</span>
            </div>
          </div>
        </div>

        {/* 3. Worst Case */}
        <div className="scenario-card scenario-worst">
          <div className="scenario-card-header">
            <div className="scenario-icon-wrap bg-amber-subtle">
              <ShieldCheck className="text-amber" size={22} />
            </div>
            <div>
              <span className="scenario-badge badge-amber">SAFETY FLOOR BOUND</span>
              <h3 className="scenario-name">Worst Case Scenario</h3>
            </div>
          </div>

          <div className="scenario-body">
            <div className="scenario-metric-row">
              <div className="scenario-term-metric">
                <span className="scenario-lbl">Semester Term GPA</span>
                <span className="scenario-val text-amber font-mono">2.00</span>
              </div>
              <div className="scenario-term-metric">
                <span className="scenario-lbl">Projected Degree CGPA</span>
                <span className="scenario-huge-val text-amber font-mono">
                  {worst.projectedCGPA.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="scenario-description">
              Assumes bare minimum passing grades (C average / 2.00) in all courses.
            </p>

            <div className="scenario-delta-box bg-amber-subtle">
              <span className="font-bold text-amber">
                {(worst.projectedCGPA - stats.cgpa).toFixed(2)} CGPA Drop
              </span>
              <span className="text-xs text-muted">Defensive floor to protect against</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Customizer */}
      <div className="scenario-customizer-card">
        <div className="flex-center gap-2">
          <Sliders size={18} className="text-primary" />
          <h4 className="font-bold">Adjust Expected Case Term GPA</h4>
        </div>

        <div className="customizer-controls">
          <div className="flex-between">
            <span className="text-muted text-sm">Assumed Term GPA:</span>
            <span className="font-mono font-bold text-accent">{customExpected.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="2.00"
            max="4.00"
            step="0.05"
            value={customExpected}
            onChange={(e) => setCustomExpected(parseFloat(e.target.value) || 2.0)}
            className="target-slider"
          />
          <div className="slider-ticks">
            <span>2.00 Bare Pass</span>
            <span>2.50</span>
            <span>3.00 Solid B</span>
            <span>3.50 Strong A-</span>
            <span>4.00 Straight A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
