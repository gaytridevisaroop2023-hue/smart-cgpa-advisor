import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import {
  GraduationCap,
  Sun,
  Moon,
  Printer,
  BookOpen,
  RotateCcw,
  UserCheck,
  ChevronDown,
  User,
  Edit3,
  LogOut,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function Navbar() {
  const {
    student,
    theme,
    toggleTheme,
    setIsGradeScaleModalOpen,
    setIsPrintSummaryOpen,
    setIsProfileModalOpen,
    resetCurrentUserCourses,
    currentUser,
    logout,
  } = useAcademic();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Derive initials
  const initials = currentUser?.initials || 
    (student.name ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST');

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
              <span className="brand-badge">PORTAL ACTIVE</span>
            </div>
            <p className="brand-subtitle">
              Intelligent GPA Calculation • What-If Simulation • Academic Strategy
            </p>
          </div>
        </div>

        {/* Student Profile Quick View & Actions */}
        <div className="header-actions">
          {/* Student Profile Pill & Private Session Dropdown */}
          <div className="profile-switcher-wrapper">
            <button
              className="btn btn-secondary profile-switcher-btn"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              title="Click to view private student session or sign out"
            >
              <div className="nav-user-avatar-badge">{initials}</div>
              <div className="profile-btn-info">
                <span className="profile-student-name">{student.name}</span>
                <span className="profile-student-meta">
                  {student.id} • Sem {student.currentSemesterNumber}
                </span>
              </div>
              <ChevronDown size={14} className={`dropdown-arrow ${profileDropdownOpen ? 'rotated' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="dropdown-menu profile-dropdown">
                {/* Active Session Info Box */}
                <div className="dropdown-user-header">
                  <div className="dropdown-user-avatar">{initials}</div>
                  <div className="dropdown-user-details">
                    <span className="dropdown-user-name">{student.name}</span>
                    <span className="dropdown-user-id">{student.id} • {student.program}</span>
                  </div>
                </div>

                <div className="private-session-status-badge" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.6875rem',
                  color: 'var(--color-emerald)',
                  background: 'var(--color-emerald-subtle)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.5rem',
                }}>
                  <ShieldCheck size={13} />
                  <span>Private Session: Courses locked to your account</span>
                </div>

                {/* Edit Student Profile Button */}
                <div className="dropdown-custom-name-box">
                  <button
                    className="btn btn-primary btn-sm btn-block"
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <Edit3 size={14} /> Edit Profile & Target GPA
                  </button>
                </div>

                {/* Reset My Courses Option */}
                <button
                  className="dropdown-item"
                  style={{ marginTop: '0.25rem' }}
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset your courses for this account?")) {
                      resetCurrentUserCourses();
                      setProfileDropdownOpen(false);
                    }
                  }}
                >
                  <div className="item-title" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <RotateCcw size={14} /> Reset My Coursework
                  </div>
                  <div className="item-desc">
                    Clear or reinitialize courses for your account
                  </div>
                </button>

                {/* Sign Out Option */}
                <div className="dropdown-divider-subtle" style={{ margin: '0.4rem 0', borderTop: '1px solid var(--border-subtle)' }} />
                <button
                  className="dropdown-item text-rose"
                  style={{ color: 'var(--color-rose)' }}
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                >
                  <div className="item-title" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <LogOut size={14} /> Sign Out of Portal
                  </div>
                  <div className="item-desc" style={{ color: 'var(--text-dim)' }}>
                    Lock courses and return to Sign In page
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Edit Name Button */}
          <button
            className="btn btn-icon-text btn-edit-name-nav"
            onClick={() => setIsProfileModalOpen(true)}
            title="Edit Student Profile & Target CGPA"
          >
            <Edit3 size={15} className="text-accent" />
            <span className="btn-label-desktop">Edit Profile</span>
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

          {/* Theme Toggle Button */}
          <button
            className="btn btn-icon-only theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} className="text-warning" /> : <Moon size={18} />}
          </button>

          {/* Explicit Sign Out Button */}
          <button
            className="btn btn-icon-text btn-signout-nav"
            onClick={logout}
            title="Sign Out of Academic Portal"
          >
            <LogOut size={15} />
            <span className="btn-label-desktop">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

