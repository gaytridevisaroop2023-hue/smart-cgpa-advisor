import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { GRADE_SCALE, getGradePoints } from '../data/gradeScale';
import { calculateSemesterStats } from '../utils/gpaCalculations';
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function CalculatorSection() {
  const {
    semesters,
    activeSemesterId,
    setActiveSemesterId,
    addSemester,
    deleteSemester,
    deleteSubject,
    setEditingSubject,
    updateSubject,
    stats,
  } = useAcademic();

  const [newSemesterName, setNewSemesterName] = useState('');
  const [newSemesterTerm, setNewSemesterTerm] = useState('');
  const [showAddSemesterForm, setShowAddSemesterForm] = useState(false);

  const activeSemester = semesters.find(s => s.id === activeSemesterId) || semesters[0];
  const activeSemesterStats = calculateSemesterStats(activeSemester);

  const handleCreateSemester = (e) => {
    e.preventDefault();
    if (!newSemesterName.trim()) return;
    addSemester(newSemesterName.trim(), newSemesterTerm.trim() || 'Upcoming Term');
    setNewSemesterName('');
    setNewSemesterTerm('');
    setShowAddSemesterForm(false);
  };

  const handleQuickGradeChange = (semesterId, subjectId, newGrade) => {
    updateSubject(semesterId, subjectId, { grade: newGrade });
  };

  return (
    <div className="section-container">
      {/* Section Header */}
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Course & CGPA Calculator</h2>
          <p className="section-subtitle">
            Manage your semester course loads, credit hours, and letter grades on a standard 4.0 GPA scale.
          </p>
        </div>
        <div className="section-actions-row">
          <button
            className="btn btn-primary"
            onClick={() => setEditingSubject({ semesterId: activeSemester?.id, subject: null })}
          >
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </div>

      {/* Semester Switcher Tabs */}
      <div className="semester-tabs-container">
        <div className="semester-tabs-list">
          {semesters.map((sem) => {
            const semStat = calculateSemesterStats(sem);
            const isActive = sem.id === activeSemesterId;

            return (
              <button
                key={sem.id}
                className={`semester-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSemesterId(sem.id)}
              >
                <div className="semester-pill-main">
                  <span className="semester-pill-name">{sem.name}</span>
                  <span className="semester-pill-gpa">
                    {semStat.gpa.toFixed(2)} GPA
                  </span>
                </div>
                <div className="semester-pill-sub">
                  <span>{semStat.credits} Cr</span>
                  {!sem.isCompleted ? (
                    <span className="tag-current">Active</span>
                  ) : (
                    <CheckCircle size={12} className="text-emerald" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Add Semester Button / Form */}
          {showAddSemesterForm ? (
            <form onSubmit={handleCreateSemester} className="add-semester-inline-form">
              <input
                type="text"
                placeholder="e.g. Semester 5"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                className="input-xs"
                autoFocus
                required
              />
              <input
                type="text"
                placeholder="e.g. Fall 2026"
                value={newSemesterTerm}
                onChange={(e) => setNewSemesterTerm(e.target.value)}
                className="input-xs"
              />
              <div className="flex-center gap-1">
                <button type="submit" className="btn btn-primary btn-xs">Add</button>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => setShowAddSemesterForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="semester-pill add-sem-btn"
              onClick={() => setShowAddSemesterForm(true)}
            >
              <Plus size={16} />
              <span>Add Semester</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Semester Overview Card */}
      {activeSemester && (
        <div className="active-semester-card">
          <div className="active-sem-header">
            <div className="sem-info-block">
              <div className="sem-badge-row">
                <span className="sem-term-tag">
                  <Calendar size={13} /> {activeSemester.term || 'Term'}
                </span>
                {!activeSemester.isCompleted ? (
                  <span className="status-tag status-active">
                    <Clock size={12} /> Currently In Progress
                  </span>
                ) : (
                  <span className="status-tag status-done">
                    <CheckCircle size={12} /> Completed Term
                  </span>
                )}
              </div>
              <h3 className="active-sem-title">{activeSemester.name}</h3>
            </div>

            <div className="active-sem-stats-grid">
              <div className="sem-stat-box">
                <span className="stat-label">Semester GPA</span>
                <span className="stat-val text-primary">{activeSemesterStats.gpa.toFixed(2)}</span>
              </div>
              <div className="sem-stat-box">
                <span className="stat-label">Semester Credits</span>
                <span className="stat-val">{activeSemesterStats.credits} Cr</span>
              </div>
              <div className="sem-stat-box">
                <span className="stat-label">Quality Points</span>
                <span className="stat-val font-mono">{activeSemesterStats.qualityPoints.toFixed(1)}</span>
              </div>
              <div className="sem-stat-box highlight-stat">
                <span className="stat-label">Overall Degree CGPA</span>
                <span className="stat-val text-accent">{stats.cgpa.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="subjects-table-wrapper">
            {activeSemester.subjects.length === 0 ? (
              <div className="empty-subjects-state">
                <BookOpen size={36} className="text-muted" />
                <p className="empty-title">No subjects added to this semester yet</p>
                <p className="empty-desc">Add your courses to calculate this semester's GPA and cumulative standing.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditingSubject({ semesterId: activeSemester.id, subject: null })}
                >
                  <Plus size={16} /> Add First Course
                </button>
              </div>
            ) : (
              <table className="subjects-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Subject Title</th>
                    <th className="text-center">Credits</th>
                    <th className="text-center">Letter Grade</th>
                    <th className="text-center">Grade Points</th>
                    <th className="text-right">Quality Points</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSemester.subjects.map((sub) => {
                    const pts = getGradePoints(sub.grade);
                    const qPoints = (sub.credits * pts).toFixed(1);

                    return (
                      <tr key={sub.id} className="subject-row">
                        <td>
                          <span className="course-code-badge">{sub.code || 'CORE'}</span>
                        </td>
                        <td>
                          <div className="course-name-cell">
                            <span className="course-name-text">{sub.name}</span>
                            {sub.credits >= 4 && (
                              <span className="high-credit-tag">4 Cr Heavy</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="credit-pill">{sub.credits} hrs</span>
                        </td>
                        <td className="text-center">
                          {/* Quick Interactive Grade Selector */}
                          <select
                            className={`grade-quick-select grade-select-${sub.grade.replace('+', 'plus').replace('-', 'minus')}`}
                            value={sub.grade}
                            onChange={(e) => handleQuickGradeChange(activeSemester.id, sub.id, e.target.value)}
                            title="Click to modify course grade"
                          >
                            {GRADE_SCALE.map((g) => (
                              <option key={g.grade} value={g.grade}>
                                {g.grade} ({g.points.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="text-center font-mono font-medium">
                          {pts.toFixed(2)}
                        </td>
                        <td className="text-right font-mono font-bold text-accent">
                          {qPoints}
                        </td>
                        <td className="text-right">
                          <div className="row-actions-wrap">
                            <button
                              className="btn-icon-xs text-muted hover-edit"
                              onClick={() => setEditingSubject({ semesterId: activeSemester.id, subject: sub })}
                              title="Edit course"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn-icon-xs text-muted hover-danger"
                              onClick={() => deleteSubject(activeSemester.id, sub.id)}
                              title="Delete course"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Semester Footer Bar */}
          <div className="active-sem-footer">
            <div className="flex-center gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditingSubject({ semesterId: activeSemester.id, subject: null })}
              >
                <Plus size={14} /> Add Course to {activeSemester.name}
              </button>
            </div>

            {semesters.length > 1 && (
              <button
                className="btn btn-ghost-danger btn-sm"
                onClick={() => deleteSemester(activeSemester.id)}
                title="Delete this entire semester"
              >
                <Trash2 size={14} /> Remove Semester
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
