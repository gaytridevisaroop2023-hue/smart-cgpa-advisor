import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { DEFAULT_USERS } from '../data/initialData';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Calculator,
  Sliders,
  Target,
  Bot,
  Sun,
  Moon,
  X,
  KeyRound,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import './SignInPage.css';

export default function SignInPage() {
  const {
    theme,
    toggleTheme,
    login,
    loginWithDemo,
    loginAsGuest,
    register,
    showToast,
  } = useAcademic();

  const [activeMode, setActiveMode] = useState('signin'); // 'signin' | 'register'

  // Sign In Form State
  const [identifier, setIdentifier] = useState('sarah.jenkins@university.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regProgram, setRegProgram] = useState('B.S. Computer Science');
  const [regFaculty, setRegFaculty] = useState('Faculty of Computing & IT');
  const [regSemester, setRegSemester] = useState(1);
  const [regTargetCGPA, setRegTargetCGPA] = useState(3.60);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Handle Sign In Submit
  const handleSignIn = (e) => {
    e.preventDefault();
    setSignInError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login({
        identifier,
        password,
        rememberMe,
      });

      setIsSubmitting(false);
      if (!res.success) {
        setSignInError(res.message);
      }
    }, 300);
  };

  // Handle Register Submit
  const handleRegister = (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter your university email.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = register({
        name: regName,
        studentId: regStudentId || `CS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        email: regEmail,
        program: regProgram,
        faculty: regFaculty,
        currentSemesterNumber: regSemester,
        targetCGPA: regTargetCGPA,
        degreeTotalCredits: 130,
        password: regPassword,
      });

      setIsSubmitting(false);
      if (!res.success) {
        setRegError(res.message);
      }
    }, 400);
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
    showToast(`Password recovery instructions sent to ${forgotEmail}`, 'info');
  };

  return (
    <div className="auth-viewport">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header className="auth-header">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <GraduationCap size={26} />
          </div>
          <div className="auth-brand-title-wrap">
            <h1 className="auth-brand-title">Smart CGPA Advisor</h1>
            <span className="auth-brand-badge">PORTAL ACCESS</span>
          </div>
        </div>

        <div className="auth-header-right">
          <div className="auth-system-status">
            <span className="status-dot-pulse"></span>
            <span>Academic Portal v2.0 • Standard 4.0 Scale</span>
          </div>

          <button
            className="theme-btn-auth"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} className="text-warning" /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="auth-main-content">
        <div className="auth-grid-layout">
          {/* LEFT: AUTH CARD */}
          <div className="auth-card-panel">
            {/* Segmented Switcher */}
            <div className="auth-tabs-segmented">
              <button
                type="button"
                className={`auth-tab-btn ${activeMode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMode('signin');
                  setSignInError('');
                }}
              >
                <LogIn size={16} />
                <span>Student Sign In</span>
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${activeMode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setActiveMode('register');
                  setRegError('');
                }}
              >
                <UserPlus size={16} />
                <span>Create Account</span>
              </button>
            </div>

            {/* SIGN IN VIEW */}
            {activeMode === 'signin' && (
              <div>
                <div className="auth-panel-heading">
                  <h2 className="auth-panel-title">Student Sign In</h2>
                  <p className="auth-panel-subtitle">
                    Enter your university credentials or select a quick demo student profile below to enter the portal.
                  </p>
                </div>

                {/* 1-Click Quick Demo Profiles */}
                <div className="auth-quick-demo-section">
                  <div className="quick-demo-header">
                    <span className="quick-demo-title">
                      <Sparkles size={14} /> 1-Click Quick Demo Access
                    </span>
                    <span className="quick-demo-badge">Click to log in immediately</span>
                  </div>

                  <div className="quick-demo-cards-row">
                    {DEFAULT_USERS.map((u) => {
                      let gpaClass = 'gpa-mid';
                      let gpaVal = '3.50';
                      if (u.profileType === 'high_achiever') {
                        gpaClass = 'gpa-high';
                        gpaVal = '3.82';
                      } else if (u.profileType === 'at_risk') {
                        gpaClass = 'gpa-recovery';
                        gpaVal = '2.18';
                      } else {
                        gpaVal = '3.20';
                      }

                      return (
                        <button
                          key={u.id}
                          type="button"
                          className="quick-demo-pill"
                          onClick={() => loginWithDemo(u.profileType)}
                          title={`Instant Sign-In as ${u.name} (${u.program})`}
                        >
                          <div className="demo-pill-top">
                            <div className="demo-pill-avatar">{u.initials}</div>
                            <span className={`demo-pill-gpa ${gpaClass}`}>{gpaVal} GPA</span>
                          </div>
                          <span className="demo-pill-name">{u.name}</span>
                          <span className="demo-pill-desc">{u.program.split(' ')[0]} • Sem {u.currentSemesterNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="auth-form-divider">or sign in with credentials</div>

                {/* Sign In Form */}
                <form onSubmit={handleSignIn} className="auth-form">
                  {signInError && (
                    <div className="auth-error-banner">
                      <AlertCircle size={16} />
                      <span>{signInError}</span>
                    </div>
                  )}

                  {/* Student ID or Email */}
                  <div className="auth-field-group">
                    <label className="auth-field-label">Student ID or University Email</label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        type="text"
                        className="auth-input-field"
                        placeholder="e.g. sarah.jenkins@university.edu or CS-2023-0482"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="auth-field-group">
                    <label className="auth-field-label">
                      <span>Password</span>
                      <span className="text-dim text-xs">(Demo accounts: password123)</span>
                    </label>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="auth-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input-field has-trailing-btn"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-trailing-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="auth-row-options">
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        className="auth-checkbox-input"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember this session</span>
                    </label>

                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() => {
                        setForgotSubmitted(false);
                        setForgotEmail(identifier || '');
                        setIsForgotModalOpen(true);
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>Signing In...</span>
                    ) : (
                      <>
                        <LogIn size={17} />
                        <span>Sign In to Academic Portal</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {/* Guest Access Alternative */}
                  <button
                    type="button"
                    className="auth-guest-btn"
                    onClick={loginAsGuest}
                  >
                    <Sparkles size={15} className="text-accent" />
                    <span>Explore as Guest Explorer (Instant Trial)</span>
                  </button>
                </form>
              </div>
            )}

            {/* CREATE ACCOUNT VIEW */}
            {activeMode === 'register' && (
              <div>
                <div className="auth-panel-heading">
                  <h2 className="auth-panel-title">Create Student Account</h2>
                  <p className="auth-panel-subtitle">
                    Set up your student profile to calculate CGPA, run What-If simulations, and plan graduation honors.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="auth-form">
                  {regError && (
                    <div className="auth-error-banner">
                      <AlertCircle size={16} />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="auth-field-group">
                    <label className="auth-field-label">Student Full Name *</label>
                    <div className="auth-input-wrapper">
                      <User size={16} className="auth-input-icon" />
                      <input
                        type="text"
                        className="auth-input-field"
                        placeholder="e.g. Alex Rivera"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Student ID & University Email in 2 columns */}
                  <div className="auth-grid-2cols">
                    <div className="auth-field-group">
                      <label className="auth-field-label">Student ID / Roll No.</label>
                      <input
                        type="text"
                        className="auth-input-field"
                        style={{ paddingLeft: '1rem' }}
                        placeholder="e.g. CS-2024-0981"
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                      />
                    </div>

                    <div className="auth-field-group">
                      <label className="auth-field-label">University Email *</label>
                      <input
                        type="email"
                        className="auth-input-field"
                        style={{ paddingLeft: '1rem' }}
                        placeholder="student@university.edu"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Degree Program */}
                  <div className="auth-field-group">
                    <label className="auth-field-label">Degree Program</label>
                    <input
                      type="text"
                      className="auth-input-field"
                      style={{ paddingLeft: '1rem' }}
                      placeholder="e.g. B.S. Computer Science"
                      value={regProgram}
                      onChange={(e) => setRegProgram(e.target.value)}
                    />
                  </div>

                  {/* Current Semester & Target CGPA */}
                  <div className="auth-grid-2cols">
                    <div className="auth-field-group">
                      <label className="auth-field-label">Current Semester (1 - 8)</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="auth-input-field font-mono"
                        style={{ paddingLeft: '1rem' }}
                        value={regSemester}
                        onChange={(e) => setRegSemester(e.target.value)}
                      />
                    </div>

                    <div className="auth-field-group">
                      <label className="auth-field-label">Target Graduation CGPA</label>
                      <input
                        type="number"
                        min="1.0"
                        max="4.0"
                        step="0.05"
                        className="auth-input-field font-mono"
                        style={{ paddingLeft: '1rem' }}
                        value={regTargetCGPA}
                        onChange={(e) => setRegTargetCGPA(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="auth-grid-2cols">
                    <div className="auth-field-group">
                      <label className="auth-field-label">Password *</label>
                      <div className="auth-input-wrapper">
                        <Lock size={16} className="auth-input-icon" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          className="auth-input-field has-trailing-btn"
                          placeholder="Min 4 chars"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="auth-trailing-btn"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                        >
                          {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="auth-field-group">
                      <label className="auth-field-label">Confirm Password *</label>
                      <div className="auth-input-wrapper">
                        <Lock size={16} className="auth-input-icon" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          className="auth-input-field"
                          placeholder="Repeat password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>Creating Profile...</span>
                    ) : (
                      <>
                        <UserPlus size={17} />
                        <span>Create Account & Start Advisor</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                    <span className="text-dim text-xs">
                      Already registered?{' '}
                      <button
                        type="button"
                        className="auth-forgot-link"
                        onClick={() => setActiveMode('signin')}
                      >
                        Sign In here
                      </button>
                    </span>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT: FEATURE SHOWCASE PANEL */}
          <div className="auth-features-panel">
            <div>
              <div className="showcase-header">
                <span className="showcase-eyebrow">
                  <ShieldCheck size={14} /> Official 4.0 Standard System
                </span>
                <h2 className="showcase-title">
                  Next-Gen Academic Performance & Intelligence
                </h2>
                <p className="showcase-subtitle">
                  Engineered specifically for university students to eliminate GPA guesswork, simulate what-ifs, and optimize your graduation standing.
                </p>
              </div>

              <div className="showcase-features-list">
                <div className="showcase-feature-item">
                  <div className="feature-item-icon-box icon-calc">
                    <Calculator size={20} />
                  </div>
                  <div className="feature-item-content">
                    <h3 className="feature-item-title">Real-Time CGPA & Semester GPA Engine</h3>
                    <p className="feature-item-desc">
                      Weighted quality point calculations conforming strictly to standard 4.0 university credit models with instant updates.
                    </p>
                  </div>
                </div>

                <div className="showcase-feature-item">
                  <div className="feature-item-icon-box icon-whatif">
                    <Sliders size={20} />
                  </div>
                  <div className="feature-item-content">
                    <h3 className="feature-item-title">What-If Simulation Sandbox</h3>
                    <p className="feature-item-desc">
                      Experiment with hypothetical grades before finals to see exactly how individual subject outcomes shift your graduation CGPA.
                    </p>
                  </div>
                </div>

                <div className="showcase-feature-item">
                  <div className="feature-item-icon-box icon-target">
                    <Target size={20} />
                  </div>
                  <div className="feature-item-content">
                    <h3 className="feature-item-title">Target Graduation GPA Planner</h3>
                    <p className="feature-item-desc">
                      Reverse-calculates the required semester GPA needed across your remaining degree credits to achieve honors or clear warning status.
                    </p>
                  </div>
                </div>

                <div className="showcase-feature-item">
                  <div className="feature-item-icon-box icon-advisor">
                    <Bot size={20} />
                  </div>
                  <div className="feature-item-content">
                    <h3 className="feature-item-title">AI Academic Strategy Advisor</h3>
                    <p className="feature-item-desc">
                      Analyzes low-performing high-credit drag courses and provides concrete retake recommendations and probation turnaround plans.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Grading Scale strip */}
              <div className="showcase-scale-strip">
                <span className="scale-strip-label">Standard 4.0 Scale:</span>
                <span>A (4.0)</span>
                <span>A- (3.7)</span>
                <span>B+ (3.3)</span>
                <span>B (3.0)</span>
                <span>B- (2.7)</span>
                <span>C+ (2.3)</span>
                <span>C (2.0)</span>
                <span>F (0.0)</span>
              </div>

              <div className="showcase-security-note">
                <ShieldCheck size={14} className="text-emerald" />
                <span>Client-Side Local Storage Privacy • No cloud tracking • Data belongs to you</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FORGOT PASSWORD MODAL ─────────────────────────────────── */}
      {isForgotModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setIsForgotModalOpen(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <KeyRound size={18} className="text-primary" />
                <h3 className="auth-modal-title">Reset Student Password</h3>
              </div>
              <button
                className="btn-icon-xs"
                onClick={() => setIsForgotModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="auth-modal-body">
              <div className="auth-modal-hint-box">
                <strong>Demo Mode Credentials:</strong>
                <p style={{ marginTop: '0.35rem' }}>
                  For pre-configured student accounts (Sarah Jenkins, Marcus Reed, Liam Chen), default password is: <code style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>password123</code>.
                </p>
              </div>

              {forgotSubmitted ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <CheckCircle2 size={36} className="text-emerald" style={{ margin: '0 auto 0.5rem' }} />
                  <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Recovery Email Dispatched</h4>
                  <p className="text-muted text-sm">
                    Instructions to access your student profile have been sent to <strong>{forgotEmail}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="auth-field-group">
                    <label className="auth-field-label">Enter University Email</label>
                    <input
                      type="email"
                      className="auth-input-field"
                      style={{ paddingLeft: '1rem' }}
                      placeholder="student@university.edu"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <button type="submit" className="auth-submit-btn" style={{ marginTop: '0.5rem' }}>
                    Send Password Recovery Link
                  </button>
                </form>
              )}
            </div>

            <div className="auth-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
