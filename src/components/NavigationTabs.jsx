import React from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  LayoutDashboard,
  Calculator,
  Sliders,
  Target,
  Zap,
  TrendingUp,
  LineChart,
  BotMessageSquare,
} from 'lucide-react';

export default function NavigationTabs() {
  const {
    activeTab,
    setActiveTab,
    simulatedGrades,
    prioritySubjects,
  } = useAcademic();

  const simulationCount = Object.keys(simulatedGrades).length;
  const highPriorityCount = prioritySubjects.filter(s => s.priority === 'HIGH').length;

  const TABS = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'calculator',
      label: 'CGPA Calculator',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'whatif',
      label: 'What-If Simulator',
      icon: Sliders,
      badge: simulationCount > 0 ? `${simulationCount} active` : null,
      badgeColor: 'badge-accent',
    },
    {
      id: 'target',
      label: 'Target Planner',
      icon: Target,
      badge: null,
    },
    {
      id: 'priority',
      label: 'Subject Priority',
      icon: Zap,
      badge: highPriorityCount > 0 ? `${highPriorityCount} High` : null,
      badgeColor: 'badge-danger',
    },
    {
      id: 'scenarios',
      label: 'Case Predictor',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'journey',
      label: 'CGPA Journey',
      icon: LineChart,
      badge: null,
    },
    {
      id: 'advisor',
      label: 'Academic Advisor',
      icon: BotMessageSquare,
      badge: 'AI',
      badgeColor: 'badge-indigo',
    },
  ];

  return (
    <nav className="nav-tabs-container">
      <div className="nav-tabs-scroll">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              className={`nav-tab-button ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
              {tab.badge && (
                <span className={`tab-badge ${tab.badgeColor || ''}`}>
                  {tab.badge}
                </span>
              )}
              {isActive && <div className="tab-active-indicator" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
