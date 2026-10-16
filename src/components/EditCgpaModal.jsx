import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { GRADE_SCALE } from '../data/gradeScale';
import {
  X,
  Award,
  Sliders,
  CheckCircle2,
  Calculator,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

export default function EditCgpaModal() {
  const {
    isEditCgpaModalOpen,
    setIsEditCgpaModalOpen,
    stats,
    semesters,
    updateSubject,
    setActiveTab,
    setPriorConsolidatedCGPA,
    activeSemesterId,
  } = useAcademic();

  const [priorCgpaInput, setPriorCgpaInput] = useState(stats.cgpa || 3.2);
  const [priorCreditsInput, setPriorCreditsInput] = useState(stats.completedCredits || 45);
  const [selectedMethod, setSelectedMethod] = useState('direct'); // 'direct' | 'courses'

  if (!isEditCgpaModalOpen) return null;

  const currentSemester = semesters.find(s => s.id === activeSemesterId) || semesters[semesters.length - 1];

  const handleApplyDirect = (e) => {
    e.preventDefault();
    const gpa = parseFloat(priorCgpaInput) || 3.0;
    const creds = parseInt(priorCreditsInput) || 30;
    setPriorConsolidatedCGPA(gpa, creds);
    setIsEditCgpaModalOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsEditCgpaModalOpen(false)}>
      <div className="modal-container modal-medium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-avatar-glow">
              <Award className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="modal-title">Overall CGPA Kaise Edit Karein?</h3>
              <p className="modal-subtitle">Choose how you want to update your Cumulative CGPA</p>
            </div>
          </div>
          <button
            className="btn-icon-xs modal-close-btn"
            onClick={() => setIsEditCgpaModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Method Selector Tabs */}
          <div className="edit-cgpa-method-toggles">
            <button
              className={`method-toggle-btn ${selectedMethod === 'direct' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('direct')}
            >
              <Sparkles size={14} />
              <span>Direct Prior CGPA (Fastest)</span>
            </button>
            <button
              className={`method-toggle-btn ${selectedMethod === 'courses' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('courses')}
            >
              <Calculator size={14} />
              <span>Course-by-Course</span>
            </button>
          </div>

          {selectedMethod === 'direct' ? (
            /* Method 1: Direct Starting / Consolidated CGPA */
            <form onSubmit={handleApplyDirect} className="direct-cgpa-form">
              <div className="method-info-callout">
                <Info size={16} className="text-primary flex-shrink-0" />
                <p>
                  Agar aap purane semesters ke har subject ko alag alag enter nahi karna chahte, to yahan apna <strong>Previous Cumulative CGPA</strong> aur <strong>Completed Credits</strong> directly enter karein:
                </p>
              </div>

              <div className="form-group">
                <label className="form-label font-bold text-accent">
                  Your Current / Previous Cumulative CGPA (0.00 - 4.00) *
                </label>
                <input
                  type="number"
                  min="0.00"
                  max="4.00"
                  step="0.01"
                  className="form-input text-lg font-mono font-bold"
                  value={priorCgpaInput}
                  onChange={(e) => setPriorCgpaInput(e.target.value)}
                  placeholder="e.g. 3.25"
                  autoFocus
                  required
                />
                <span className="form-helper">Jo CGPA aap set karna chahte hain wo yahan likhein</span>
              </div>

              <div className="form-group">
                <label className="form-label">Completed Credit Hours</label>
                <input
                  type="number"
                  min="0"
                  max="160"
                  step="1"
                  className="form-input font-mono"
                  value={priorCreditsInput}
                  onChange={(e) => setPriorCreditsInput(e.target.value)}
                  placeholder="e.g. 45"
                  required
                />
                <span className="form-helper">Ab tak kitne credit hours complete huway hain (e.g. 45, 60, etc.)</span>
              </div>

              <div className="modal-footer modal-footer-inline">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditCgpaModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> Save Overall CGPA
                </button>
              </div>
            </form>
          ) : (
            /* Method 2: Course-by-Course editing */
            <div className="courses-quick-edit-section">
              <div className="method-info-callout">
                <Info size={16} className="text-emerald flex-shrink-0" />
                <p>
                  Overall CGPA aapke sabhi semesters ke subjects ke grades se banta hai. Aap neeche apne current courses ke grades directly change kar sakte hain:
                </p>
              </div>

              <div className="modal-courses-list">
                {currentSemester?.subjects.map((sub) => (
                  <div key={sub.id} className="modal-course-item">
                    <div className="course-item-info">
                      <span className="font-bold text-sm">{sub.name}</span>
                      <span className="text-xs text-muted">({sub.credits} Credit Hours)</span>
                    </div>

                    <select
                      className="grade-quick-select text-xs"
                      value={sub.grade}
                      onChange={(e) => updateSubject(currentSemester.id, sub.id, { grade: e.target.value })}
                    >
                      {GRADE_SCALE.map((g) => (
                        <option key={g.grade} value={g.grade}>
                          Grade {g.grade} ({g.points.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="modal-footer modal-footer-inline">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setIsEditCgpaModalOpen(false);
                    setActiveTab('whatif');
                  }}
                >
                  <Sliders size={14} /> Open What-If Sandbox
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setIsEditCgpaModalOpen(false);
                    setActiveTab('calculator');
                  }}
                >
                  <span>Open Full Calculator</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
