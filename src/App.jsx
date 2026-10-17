import React from 'react';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import Navbar from './components/Navbar';
import NavigationTabs from './components/NavigationTabs';
import DashboardView from './pages/DashboardView';
import CalculatorSection from './components/CalculatorSection';
import WhatIfSimulator from './components/WhatIfSimulator';
import TargetPlanner from './components/TargetPlanner';
import SubjectPriority from './components/SubjectPriority';
import ScenarioPredictor from './components/ScenarioPredictor';
import CgpaJourneyChart from './components/CgpaJourneyChart';
import AcademicAdvisorChat from './components/AcademicAdvisorChat';
import AddSubjectModal from './components/AddSubjectModal';
import GradeScaleModal from './components/GradeScaleModal';
import PrintSummaryModal from './components/PrintSummaryModal';
import EditProfileModal from './components/EditProfileModal';
import EditCgpaModal from './components/EditCgpaModal';
import SignInPage from './pages/SignInPage';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import './App.css';

function MainLayout() {
  const { activeTab } = useAcademic();

  return (
    <div className="app-viewport">
      {/* Navbar */}
      <Navbar />

      {/* Navigation Tabs Bar */}
      <NavigationTabs />

      {/* Main Tab Content */}
      <main className="main-content-area">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'calculator' && <CalculatorSection />}
        {activeTab === 'whatif' && <WhatIfSimulator />}
        {activeTab === 'target' && <TargetPlanner />}
        {activeTab === 'priority' && <SubjectPriority />}
        {activeTab === 'scenarios' && <ScenarioPredictor />}
        {activeTab === 'journey' && <CgpaJourneyChart />}
        {activeTab === 'advisor' && <AcademicAdvisorChat />}
      </main>

      {/* Footer */}
      <footer className="app-footer no-print">
        <div className="footer-container">
          <div className="footer-left">
            <span className="footer-brand">Smart CGPA Advisor</span>
            <span className="footer-copy">
              © 2026 Academic Performance & Intelligence System • Standard 4.0 Scale
            </span>
          </div>
          <div className="footer-right">
            <span className="footer-tag">University Presentation Ready</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AddSubjectModal />
      <GradeScaleModal />
      <PrintSummaryModal />
      <EditProfileModal />
      <EditCgpaModal />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, toast } = useAcademic();

  return (
    <div className="app-root-shell">
      {!isAuthenticated ? <SignInPage /> : <MainLayout />}

      {/* Global Toast Notification Container */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald" />}
            {toast.type === 'warning' && <AlertCircle size={16} className="text-warning" />}
            {toast.type === 'info' && <Info size={16} className="text-primary" />}
          </div>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AcademicProvider>
      <AppContent />
    </AcademicProvider>
  );
}

