import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { DEMO_PROFILES } from '../data/initialData';
import {
  GraduationCap,
  Sun,
  Moon,
  Printer,
  BookOpen,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Sparkles,
  User,
  Edit3,
} from 'lucide-react';

export default function Navbar() {
  const {
    student,
    theme,
    toggleTheme,
    setIsGradeScaleModalOpen,
    setIsPrintSummaryOpen,
    setIsProfileModalOpen,
    resetToDefaultData,
    loadDemoProfile,
  } = useAcademic();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <div className="brand-section">
          <div className="brand-logo-glow">
            <GraduationCap className="brand-icon" size={28} />
          </div>
          <div className="brand-text">
            <div className="brand-title-wrap">
              <h1 className="brand-title">Smart CGPA Advisor</h1>
              <span className="brand-badge">PRO ACADEMIC</span>
            </div>
            <p className="brand-subtitle">
              Intelligent GPA Calculation • What-If Simulation • Academic Strategy
            </p>
          </div>
        </div>

        {/* Student Profile Quick View & Actions */}
        <div className="header-actions">
          {/* Student Profile Switcher & Name Editor */}
          <div className="profile-switcher-wrapper">
            <button
              className="btn btn-secondary profile-switcher-btn"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              title="Click to switch profiles or enter custom name"
            >
              <UserCheck size={16} className="text-primary" />
              <div className="profile-btn-info">
                <span className="profile-student-name">{student.name}</span>
                <span className="profile-student-meta">
                  {student.program.split(' ')[0]} • Sem {student.currentSemesterNumber}
                </span>
              </div>
              <ChevronDown size={14} className={`dropdown-arrow ${profileDropdownOpen ? 'rotated' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="dropdown-menu profile-dropdown">
                {/* Direct Enter Your Name Button */}
                <div className="dropdown-custom-name-box">
                  <button
                    className="btn btn-primary btn-sm btn-block"
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <Edit3 size={14} /> Enter Your Name & Details
                  </button>
                </div>

                <div className="dropdown-header">
                  <Sparkles size={14} className="text-accent" />
                  <span>Or Choose Demo Profile</span>
                </div>
                {DEMO_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    className="dropdown-item"
                    onClick={() => {
                      loadDemoProfile(p.id);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <div className="item-title">{p.label}</div>
                    <div className="item-desc">{p.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Edit Name Button */}
          <button
            className="btn btn-icon-text btn-edit-name-nav"
            onClick={() => setIsProfileModalOpen(true)}
            title="Enter / Edit Student Name"
          >
            <Edit3 size={15} className="text-accent" />
            <span className="btn-label-desktop">Edit Name</span>
          </button>

          {/* Grade Scale Reference Button */}
          <button
            className="btn btn-icon-text"
            onClick={() => setIsGradeScaleModalOpen(true)}
            title="View 4.0 Grading Scale"
          >
            <BookOpen size={16} />
            <span className="btn-label-desktop">Scale</span>
          </button>

          {/* Print Academic Audit Button */}
          <button
            className="btn btn-icon-text"
            onClick={() => setIsPrintSummaryOpen(true)}
            title="Generate Printable Academic Audit Report"
          >
            <Printer size={16} />
            <span className="btn-label-desktop">Export Report</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            className="btn btn-icon-only"
            onClick={resetToDefaultData}
            title="Reset data to standard default"
          >
            <RotateCcw size={16} />
          </button>

          {/* Theme Toggle Button */}
          <button
            className="btn btn-icon-only theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} className="text-warning" /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
