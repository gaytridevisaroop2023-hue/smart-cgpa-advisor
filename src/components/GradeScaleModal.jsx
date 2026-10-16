import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import { GRADE_SCALE } from '../data/gradeScale';
import { X, Award, HelpCircle } from 'lucide-react';

export default function GradeScaleModal() {
  const { isGradeScaleModalOpen, setIsGradeScaleModalOpen } = useAcademic();

  if (!isGradeScaleModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsGradeScaleModalOpen(false)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Award className="text-primary" size={22} />
            <div>
              <h3 className="modal-title">Standard 4.0 GPA Grading Scale</h3>
              <p className="modal-subtitle">Official university quality points conversion benchmark</p>
            </div>
          </div>
          <button
            className="btn-icon-xs modal-close-btn"
            onClick={() => setIsGradeScaleModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="scale-table-wrap">
            <table className="scale-table">
              <thead>
                <tr>
                  <th>Letter Grade</th>
                  <th>Grade Points (4.0)</th>
                  <th>Percentage Equivalent</th>
                  <th>Academic Standing</th>
                </tr>
              </thead>
              <tbody>
                {GRADE_SCALE.map((item) => (
                  <tr key={item.grade} className={item.points >= 3.5 ? 'highlight-row' : ''}>
                    <td>
                      <span className={`grade-chip grade-${item.grade.replace('+', 'plus').replace('-', 'minus')}`}>
                        {item.grade}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-accent">{item.points.toFixed(2)}</td>
                    <td className="text-secondary">{item.percentage}</td>
                    <td className="text-muted">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scale-info-box">
            <HelpCircle size={16} className="text-primary" />
            <p>
              <strong>How CGPA is Computed:</strong> Quality Points = Credit Hours × Grade Points.
              Semester GPA is calculated by dividing total Quality Points earned in that semester by total Credit Hours registered.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={() => setIsGradeScaleModalOpen(false)}
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
}
