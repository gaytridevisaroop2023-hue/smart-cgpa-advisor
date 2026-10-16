import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { calculateSemesterStats } from '../utils/gpaCalculations';
import {
  LineChart as ChartIcon,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export default function CgpaJourneyChart() {
  const { semesters, stats, student } = useAcademic();
  const [chartMode, setChartMode] = useState('cumulative'); // 'cumulative' | 'term' | 'both'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Compute points for each semester
  let cumCredits = 0;
  let cumQP = 0;

  const journeyPoints = semesters.map((sem, idx) => {
    const semStat = calculateSemesterStats(sem);
    cumCredits += semStat.credits;
    cumQP += semStat.qualityPoints;
    const cgpa = cumCredits > 0 ? parseFloat((cumQP / cumCredits).toFixed(2)) : 0;

    return {
      index: idx,
      id: sem.id,
      name: sem.name,
      term: sem.term,
      isCompleted: sem.isCompleted,
      termGPA: semStat.gpa,
      cgpa,
      credits: semStat.credits,
      totalCreditsSoFar: cumCredits,
    };
  });

  const firstCGPA = journeyPoints[0]?.cgpa || 0;
  const latestCGPA = journeyPoints[journeyPoints.length - 1]?.cgpa || 0;
  const overallRise = parseFloat((latestCGPA - firstCGPA).toFixed(2));

  // Chart SVG Coordinates & Calculations
  const width = 800;
  const height = 340;
  const padLeft = 60;
  const padRight = 50;
  const padTop = 40;
  const padBottom = 60;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minScale = 1.8;
  const maxScale = 4.0;

  const getY = (val) => {
    const clamped = Math.max(minScale, Math.min(maxScale, val));
    return padTop + chartH - ((clamped - minScale) / (maxScale - minScale)) * chartH;
  };

  const getX = (idx) => {
    if (journeyPoints.length <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (journeyPoints.length - 1)) * chartW;
  };

  // Build SVG path strings with smooth curves
  const buildSmoothPath = (pts, key) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${getX(0)} ${getY(pts[0][key])}`;

    let path = `M ${getX(0)} ${getY(pts[0][key])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(pts[i][key]);
      const x1 = getX(i + 1);
      const y1 = getY(pts[i + 1][key]);

      const cx = (x0 + x1) / 2;
      path += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return path;
  };

  const cgpaPath = buildSmoothPath(journeyPoints, 'cgpa');
  const termGpaPath = buildSmoothPath(journeyPoints, 'termGPA');

  // Area path for gradient underfill
  const cgpaAreaPath = journeyPoints.length > 0 
    ? `${cgpaPath} L ${getX(journeyPoints.length - 1)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`
    : '';

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <div className="flex-center gap-2">
            <h2 className="section-title">CGPA Journey & Semester Trajectory</h2>
            <span className="badge-highlight">
              <TrendingUp size={13} /> Semester-by-Semester
            </span>
          </div>
          <p className="section-subtitle">
            Visual progression of your cumulative CGPA and individual semester term GPAs over your academic career.
          </p>
        </div>

        {/* View Toggle */}
        <div className="section-actions-row">
          <div className="chart-mode-toggles">
            <button
              className={`btn-mode ${chartMode === 'cumulative' ? 'active' : ''}`}
              onClick={() => setChartMode('cumulative')}
            >
              Cumulative CGPA
            </button>
            <button
              className={`btn-mode ${chartMode === 'term' ? 'active' : ''}`}
              onClick={() => setChartMode('term')}
            >
              Semester GPA
            </button>
            <button
              className={`btn-mode ${chartMode === 'both' ? 'active' : ''}`}
              onClick={() => setChartMode('both')}
            >
              Compare Both
            </button>
          </div>
        </div>
      </div>

      {/* Hero Interactive Chart Container */}
      <div className="chart-wrapper-card">
        <div className="chart-legend-bar">
          <div className="legend-items-left">
            {(chartMode === 'cumulative' || chartMode === 'both') && (
              <div className="legend-item">
                <span className="legend-dot dot-primary" />
                <span>Cumulative CGPA</span>
              </div>
            )}
            {(chartMode === 'term' || chartMode === 'both') && (
              <div className="legend-item">
                <span className="legend-dot dot-secondary" />
                <span>Semester Term GPA</span>
              </div>
            )}
          </div>
          <div className="legend-items-right text-muted text-xs">
            <span>Hover on points for detailed semester breakdown</span>
          </div>
        </div>

        <div className="svg-container-box">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="journey-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="cgpaAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-glow)" stopOpacity="0.38" />
                <stop offset="100%" stopColor="var(--accent-glow)" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Grid & Threshold Lines */}
            {[4.0, 3.5, 3.0, 2.5, 2.0].map((val) => {
              const y = getY(val);
              const isThreshold = val === 3.5 || val === 3.0 || val === 2.0;

              return (
                <g key={val} className="chart-grid-line">
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke={isThreshold ? 'var(--border-strong)' : 'var(--border-subtle)'}
                    strokeDasharray={val === 3.5 ? '4 4' : 'none'}
                    strokeWidth={val === 3.5 ? '1.5' : '1'}
                  />
                  <text
                    x={padLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="chart-axis-label font-mono"
                  >
                    {val.toFixed(1)}
                  </text>
                  {val === 3.5 && (
                    <text
                      x={width - padRight + 6}
                      y={y + 4}
                      className="threshold-label text-emerald"
                    >
                      Dean's List (3.5)
                    </text>
                  )}
                  {val === 3.0 && (
                    <text
                      x={width - padRight + 6}
                      y={y + 4}
                      className="threshold-label text-blue"
                    >
                      Good (3.0)
                    </text>
                  )}
                </g>
              );
            })}

            {/* Area Fill for Cumulative CGPA */}
            {(chartMode === 'cumulative' || chartMode === 'both') && (
              <path d={cgpaAreaPath} fill="url(#cgpaAreaGradient)" />
            )}

            {/* Semester GPA Line */}
            {(chartMode === 'term' || chartMode === 'both') && (
              <path
                d={termGpaPath}
                fill="none"
                stroke="var(--color-secondary-line)"
                strokeWidth="2.5"
                strokeDasharray={chartMode === 'both' ? '6 4' : 'none'}
              />
            )}

            {/* Cumulative CGPA Line */}
            {(chartMode === 'cumulative' || chartMode === 'both') && (
              <path
                d={cgpaPath}
                fill="none"
                stroke="var(--color-primary-line)"
                strokeWidth="3.5"
                filter="url(#glowFilter)"
              />
            )}

            {/* Semester X-Axis Labels & Nodes */}
            {journeyPoints.map((pt) => {
              const x = getX(pt.index);
              const yCgpa = getY(pt.cgpa);
              const yTerm = getY(pt.termGPA);
              const isHovered = hoveredPoint?.id === pt.id;

              return (
                <g key={pt.id} className="chart-node-group">
                  {/* Vertical dashed indicator */}
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + chartH}
                    stroke="var(--border-subtle)"
                    strokeDasharray="2 4"
                    strokeWidth="1"
                  />

                  {/* Semester Label below */}
                  <text
                    x={x}
                    y={padTop + chartH + 20}
                    textAnchor="middle"
                    className="chart-x-label font-medium"
                  >
                    {pt.name.replace('Semester ', 'Sem ')}
                  </text>
                  <text
                    x={x}
                    y={padTop + chartH + 36}
                    textAnchor="middle"
                    className="chart-x-sub text-muted"
                  >
                    {pt.term}
                  </text>

                  {/* Term GPA Point Node */}
                  {(chartMode === 'term' || chartMode === 'both') && (
                    <circle
                      cx={x}
                      cy={yTerm}
                      r={isHovered ? 6 : 4.5}
                      fill="var(--card-bg)"
                      stroke="var(--color-secondary-line)"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Cumulative CGPA Node */}
                  {(chartMode === 'cumulative' || chartMode === 'both') && (
                    <g
                      className="interactive-node"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle
                        cx={x}
                        cy={yCgpa}
                        r={isHovered ? 8 : 6}
                        fill="var(--card-bg)"
                        stroke="var(--color-primary-line)"
                        strokeWidth="3.5"
                        className="pulse-node"
                      />
                      {/* Node Value Label above point */}
                      <text
                        x={x}
                        y={yCgpa - 12}
                        textAnchor="middle"
                        className="node-floating-val font-mono font-bold"
                      >
                        {pt.cgpa.toFixed(2)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="chart-hover-tooltip"
              style={{
                left: `${(getX(hoveredPoint.index) / width) * 100}%`,
                top: `${(getY(hoveredPoint.cgpa) / height) * 100}%`,
              }}
            >
              <div className="tooltip-title">{hoveredPoint.name} ({hoveredPoint.term})</div>
              <div className="tooltip-row">
                <span>Cumulative CGPA:</span>
                <strong>{hoveredPoint.cgpa.toFixed(2)}</strong>
              </div>
              <div className="tooltip-row">
                <span>Semester GPA:</span>
                <strong>{hoveredPoint.termGPA.toFixed(2)}</strong>
              </div>
              <div className="tooltip-row">
                <span>Semester Load:</span>
                <span>{hoveredPoint.credits} Credits</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trajectory Insights Metrics */}
      <div className="journey-metrics-grid">
        <div className="journey-stat-card">
          <span className="j-lbl">Starting Baseline</span>
          <span className="j-val font-mono">{firstCGPA.toFixed(2)}</span>
          <span className="j-sub">Semester 1</span>
        </div>

        <div className="journey-stat-card">
          <span className="j-lbl">Current Standing</span>
          <span className="j-val font-mono text-accent">{latestCGPA.toFixed(2)}</span>
          <span className="j-sub">Semester {journeyPoints.length}</span>
        </div>

        <div className="journey-stat-card">
          <span className="j-lbl">Total Academic Growth</span>
          <span className={`j-val font-mono ${overallRise >= 0 ? 'text-emerald' : 'text-danger'}`}>
            {overallRise >= 0 ? `+${overallRise.toFixed(2)}` : overallRise.toFixed(2)}
          </span>
          <span className="j-sub">Net points improved</span>
        </div>

        <div className="journey-stat-card">
          <span className="j-lbl">Career Trajectory</span>
          <span className="j-val text-emerald font-bold">
            {overallRise > 0.3 ? 'Accelerating Growth' : overallRise >= 0 ? 'Steady Improvement' : 'Needs Intervention'}
          </span>
          <span className="j-sub">Trajectory health</span>
        </div>
      </div>
    </div>
  );
}
