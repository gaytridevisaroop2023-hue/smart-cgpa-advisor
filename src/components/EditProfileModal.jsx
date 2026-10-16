import React, { useState, useEffect } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { X, User, Save, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EditProfileModal() {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    student,
    updateStudent,
    showToast,
  } = useAcademic();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [program, setProgram] = useState('');
  const [faculty, setFaculty] = useState('');
  const [semesterNumber, setSemesterNumber] = useState(4);
  const [degreeTotalCredits, setDegreeTotalCredits] = useState(130);
  const [targetCGPA, setTargetCGPA] = useState(3.5);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setStudentId(student.id || '');
      setProgram(student.program || '');
      setFaculty(student.faculty || '');
      setSemesterNumber(student.currentSemesterNumber || 4);
      setDegreeTotalCredits(student.degreeTotalCredits || 130);
      setTargetCGPA(student.targetCGPA || 3.5);
    }
    setError('');
  }, [student, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const semNum = parseInt(semesterNumber) || 1;
    const credNum = parseInt(degreeTotalCredits) || 130;
    const tgt = parseFloat(targetCGPA) || 3.5;

    updateStudent({
      name: name.trim(),
      id: studentId.trim() || 'STU-2026',
      program: program.trim() || 'B.S. Computer Science',
      faculty: faculty.trim() || 'Faculty of Computing',
      currentSemesterNumber: Math.max(1, Math.min(12, semNum)),
      degreeTotalCredits: Math.max(30, Math.min(240, credNum)),
      targetCGPA: Math.max(1.0, Math.min(4.0, tgt)),
    });

    showToast(`Welcome, ${name.trim()}! Your profile has been updated.`, 'success');
    setIsProfileModalOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsProfileModalOpen(false)}>
      <div className="modal-container modal-medium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-avatar-glow">
              <User className="text-primary" size={22} />
            </div>
            <div>
              <h3 className="modal-title">Student Profile & Settings</h3>
              <p className="modal-subtitle">Enter your name and degree information</p>
            </div>
          </div>
          <button
            className="btn-icon-xs modal-close-btn"
            onClick={() => setIsProfileModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body form-grid">
            {error && (
              <div className="form-alert-error col-span-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Student Full Name */}
            <div className="form-group col-span-2">
              <label className="form-label font-bold text-accent">
                Your Full Name *
              </label>
              <input
                type="text"
                className="form-input text-lg font-bold"
                placeholder="e.g. Alex Mercer, Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
              <span className="form-helper">
                This name will appear on your dashboard, transcript audit report, and AI advisor chats.
              </span>
            </div>

            {/* Student ID */}
            <div className="form-group">
              <label className="form-label">Student ID / Roll No.</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="e.g. CS-2024-0482"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            {/* Degree Program */}
            <div className="form-group">
              <label className="form-label">Degree Program</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.S. Computer Science"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
            </div>

            {/* Current Semester */}
            <div className="form-group">
              <label className="form-label">Current Semester (1 - 10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input font-mono"
                value={semesterNumber}
                onChange={(e) => setSemesterNumber(e.target.value)}
              />
            </div>

            {/* Total Degree Credits */}
            <div className="form-group">
              <label className="form-label">Total Degree Credits</label>
              <input
                type="number"
                min="60"
                max="200"
                className="form-input font-mono"
                value={degreeTotalCredits}
                onChange={(e) => setDegreeTotalCredits(e.target.value)}
              />
              <span className="form-helper">Standard bachelor degree: 120 - 136 Cr</span>
            </div>

            {/* Target CGPA */}
            <div className="form-group col-span-2">
              <label className="form-label">Target Graduation CGPA</label>
              <input
                type="number"
                min="1.0"
                max="4.0"
                step="0.05"
                className="form-input font-mono"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsProfileModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
