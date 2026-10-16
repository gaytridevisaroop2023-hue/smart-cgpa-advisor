import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Info,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function RiskAlertBanner() {
  const { riskAlert, setActiveTab, simulatedGrades } = useAcademic();

  if (!riskAlert) return null;

  const hasSimulation = Object.keys(simulatedGrades).length > 0;

  const getAlertIcon = () => {
    switch (riskAlert.type) {
      case 'danger':
        return <AlertOctagon className="alert-icon-svg text-danger" size={24} />;
      case 'warning':
        return <AlertTriangle className="alert-icon-svg text-warning" size={24} />;
      case 'success':
        return <CheckCircle2 className="alert-icon-svg text-success" size={24} />;
      default:
        return <Info className="alert-icon-svg text-info" size={24} />;
    }
  };

  return (
    <div className={`risk-alert-banner alert-${riskAlert.type}`}>
      <div className="alert-content-left">
        <div className="alert-icon-bubble">
          {getAlertIcon()}
        </div>
        <div className="alert-text-body">
          <div className="alert-headline-row">
            <h4 className="alert-title">{riskAlert.title}</h4>
            {hasSimulation && (
              <span className="alert-mode-tag">
                <Sparkles size={12} /> Based on What-If Simulation
              </span>
            )}
          </div>
          <p className="alert-message">{riskAlert.message}</p>
          {riskAlert.advice && (
            <p className="alert-advice">
              <strong>Strategy:</strong> {riskAlert.advice}
            </p>
          )}
        </div>
      </div>

      <div className="alert-action-right">
        {riskAlert.type === 'warning' || riskAlert.type === 'danger' ? (
          <button
            className="btn btn-alert-action"
            onClick={() => setActiveTab('priority')}
          >
            <span>Review Subject Priority</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            className="btn btn-alert-action"
            onClick={() => setActiveTab('target')}
          >
            <span>Explore Target Plan</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
