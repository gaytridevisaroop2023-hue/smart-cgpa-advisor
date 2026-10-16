import React, { useState, useEffect } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { GRADE_SCALE, getGradePoints } from '../data/gradeScale';
import { X, Plus, Save, AlertCircle, BookOpen } from 'lucide-react';

export default function AddSubjectModal() {
  const {
    editingSubject,
    setEditingSubject,
    addSubject,
    updateSubject,
    activeSemesterId,
    semesters,
  } = useAcademic();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);
  const [grade, setGrade] = useState('B');
  const [selectedSemesterId, setSelectedSemesterId] = useState(activeSemesterId);
  const [error, setError] = useState('');

  const isEditing = Boolean(editingSubject && editingSubject.subject);

  useEffect(() => {
    if (editingSubject && editingSubject.subject) {
      const sub = editingSubject.subject;
      setCode(sub.code || '');
      setName(sub.name || '');
      setCredits(sub.credits || 3);
      setGrade(sub.grade || 'B');
      setSelectedSemesterId(editingSubject.semesterId || activeSemesterId);
    } else {
      setCode('');
      setName('');
      setCredits(3);
      setGrade('B');
      setSelectedSemesterId(activeSemesterId);
    }
    setError('');
  }, [editingSubject, activeSemesterId]);

  if (!editingSubject) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a course/subject name.');
      return;
    }

    const credNum = parseFloat(credits);
    if (isNaN(credNum) || credNum <= 0 || credNum > 10) {
      setError('Credit hours must be a number between 1 and 10 (typical 1 to 4).');
      return;
    }

    if (!selectedSemesterId) {
      setError('Please select a target semester.');
      return;
    }

    if (isEditing) {
      updateSubject(editingSubject.semesterId, editingSubject.subject.id, {
        code: code.trim().toUpperCase() || 'COURSE',
        name: name.trim(),
        credits: credNum,
        grade,
      });
    } else {
      addSubject(selectedSemesterId, {
        code: code.trim().toUpperCase() || 'COURSE',
        name: name.trim(),
        credits: credNum,
        grade,
      });
    }

    setEditingSubject(null);
  };

  const currentGradePoints = getGradePoints(grade);
  const potentialQualityPoints = (parseFloat(credits) || 0) * currentGradePoints;

  return (
    <div className="modal-backdrop" onClick={() => setEditingSubject(null)}>
      <div className="modal-container modal-medium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpen className="text-primary" size={22} />
            <div>
              <h3 className="modal-title">
                {isEditing ? 'Edit Subject Details' : 'Add New Subject'}
              </h3>
              <p className="modal-subtitle">
                Enter course information, credit weighting, and assigned grade
              </p>
            </div>
          </div>
          <button
            className="btn-icon-xs modal-close-btn"
            onClick={() => setEditingSubject(null)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body form-grid">
            {error && (
              <div className="form-alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Target Semester */}
            <div className="form-group col-span-2">
              <label className="form-label">Semester</label>
              <select
                className="form-select"
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                disabled={isEditing}
              >
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name} ({sem.term}) {!sem.isCompleted ? '• Current' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Code */}
            <div className="form-group">
              <label className="form-label">Course Code (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CS203, MTH101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            {/* Course Name */}
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Object Oriented Programming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Credit Hours */}
            <div className="form-group">
              <label className="form-label">Credit Hours (1 - 6) *</label>
              <input
                type="number"
                min="1"
                max="6"
                step="1"
                className="form-input"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
              />
              <span className="form-helper">Most lecture courses are 3 or 4 Cr; labs are 1 Cr</span>
            </div>

            {/* Grade Selection */}
            <div className="form-group">
              <label className="form-label">Letter Grade *</label>
              <select
                className="form-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                {GRADE_SCALE.map((g) => (
                  <option key={g.grade} value={g.grade}>
                    {g.grade} ({g.points.toFixed(2)} pts - {g.percentage})
                  </option>
                ))}
              </select>
              <span className="form-helper">
                Quality Points = {potentialQualityPoints.toFixed(2)} pts ({credits} Cr × {currentGradePoints.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditingSubject(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? (
                <>
                  <Save size={16} /> Save Changes
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Subject
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
