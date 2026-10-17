import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SAMPLE_STUDENT, INITIAL_SEMESTERS, DEMO_PROFILES, DEFAULT_USERS } from '../data/initialData';
import {
  calculateCumulativeStats,
  calculateWhatIfCGPA,
  calculateTargetPlan,
  calculateSubjectPriority,
  calculateScenarios,
  determineRiskAlert,
} from '../utils/gpaCalculations';

const AcademicContext = createContext();

export function AcademicProvider({ children }) {
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smart_cgpa_theme') || 'dark';
  });

  // Auth State & User Accounts
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_cgpa_users_db');
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smart_cgpa_is_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_cgpa_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Student Profile
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('smart_cgpa_student');
    return saved ? JSON.parse(saved) : SAMPLE_STUDENT;
  });

  // Semesters Data
  const [semesters, setSemesters] = useState(() => {
    const saved = localStorage.getItem('smart_cgpa_semesters');
    return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
  });

  // Currently Selected Semester for details/editor
  const [activeSemesterId, setActiveSemesterId] = useState(() => {
    return INITIAL_SEMESTERS[INITIAL_SEMESTERS.length - 1]?.id || 'sem-4';
  });

  // What-If Simulation modified grades map: { [subjectId]: gradeLetter }
  const [simulatedGrades, setSimulatedGrades] = useState({});

  // Toast Notification System
  const [toast, setToast] = useState(null);

  // Modals state
  const [isGradeScaleModalOpen, setIsGradeScaleModalOpen] = useState(false);
  const [isPrintSummaryOpen, setIsPrintSummaryOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditCgpaModalOpen, setIsEditCgpaModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null); // { semesterId, subject } or null

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('smart_cgpa_users_db', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('smart_cgpa_is_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smart_cgpa_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smart_cgpa_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('smart_cgpa_student', JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem('smart_cgpa_semesters', JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem('smart_cgpa_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Computations
  const stats = useMemo(() => {
    return calculateCumulativeStats(semesters);
  }, [semesters]);

  const whatIfStats = useMemo(() => {
    return calculateWhatIfCGPA(semesters, simulatedGrades);
  }, [semesters, simulatedGrades]);

  const remainingCredits = useMemo(() => {
    const total = student.degreeTotalCredits || 130;
    return Math.max(0, total - stats.totalCredits);
  }, [student.degreeTotalCredits, stats.totalCredits]);

  const targetPlan = useMemo(() => {
    return calculateTargetPlan(
      stats.cgpa,
      stats.completedCredits || stats.totalCredits,
      remainingCredits,
      student.targetCGPA
    );
  }, [stats.cgpa, stats.completedCredits, stats.totalCredits, remainingCredits, student.targetCGPA]);

  const prioritySubjects = useMemo(() => {
    return calculateSubjectPriority(semesters);
  }, [semesters]);

  const scenarios = useMemo(() => {
    return calculateScenarios(semesters);
  }, [semesters]);

  const riskAlert = useMemo(() => {
    const projected = Object.keys(simulatedGrades).length > 0 
      ? whatIfStats.simulatedCGPA 
      : stats.cgpa;
    const highCount = prioritySubjects.filter(s => s.priority === 'HIGH').length;
    return determineRiskAlert(stats.cgpa, projected, student.targetCGPA, highCount);
  }, [stats.cgpa, whatIfStats.simulatedCGPA, simulatedGrades, student.targetCGPA, prioritySubjects]);

  // Academic Actions
  const updateStudent = (fields) => {
    setStudent(prev => ({ ...prev, ...fields }));
    showToast("Student profile updated", "success");
  };

  const updateTargetCGPA = (target) => {
    const val = parseFloat(target) || 0;
    setStudent(prev => ({ ...prev, targetCGPA: val }));
    showToast(`Target CGPA updated to ${val.toFixed(2)}`, "success");
  };

  const addSemester = (name, term = "Term") => {
    const newId = `sem-${Date.now()}`;
    const newSemester = {
      id: newId,
      name: name || `Semester ${semesters.length + 1}`,
      term: term || "Upcoming",
      isCompleted: false,
      subjects: [],
    };
    setSemesters(prev => [...prev, newSemester]);
    setActiveSemesterId(newId);
    showToast(`Added new semester: ${newSemester.name}`, "success");
  };

  const deleteSemester = (semesterId) => {
    if (semesters.length <= 1) {
      showToast("Cannot delete the only semester.", "warning");
      return;
    }
    setSemesters(prev => prev.filter(s => s.id !== semesterId));
    if (activeSemesterId === semesterId) {
      const remaining = semesters.filter(s => s.id !== semesterId);
      setActiveSemesterId(remaining[0].id);
    }
    showToast("Semester deleted", "info");
  };

  const addSubject = (semesterId, subjectData) => {
    const newSub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: (subjectData.code || "").toUpperCase().trim() || "GEN100",
      name: (subjectData.name || "").trim() || "Course Subject",
      credits: Math.max(1, Math.min(6, parseFloat(subjectData.credits) || 3)),
      grade: subjectData.grade || "B",
    };

    setSemesters(prev =>
      prev.map(sem => {
        if (sem.id === semesterId) {
          return { ...sem, subjects: [...sem.subjects, newSub] };
        }
        return sem;
      })
    );
    showToast(`Added "${newSub.name}" (${newSub.credits} Cr, Grade ${newSub.grade})`, "success");
  };

  const updateSubject = (semesterId, subjectId, updatedFields) => {
    setSemesters(prev =>
      prev.map(sem => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            subjects: sem.subjects.map(sub => {
              if (sub.id === subjectId) {
                return {
                  ...sub,
                  ...updatedFields,
                  credits: updatedFields.credits !== undefined 
                    ? Math.max(1, Math.min(6, parseFloat(updatedFields.credits) || 3))
                    : sub.credits,
                };
              }
              return sub;
            }),
          };
        }
        return sem;
      })
    );
    showToast("Course details updated", "success");
  };

  const deleteSubject = (semesterId, subjectId) => {
    setSemesters(prev =>
      prev.map(sem => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            subjects: sem.subjects.filter(sub => sub.id !== subjectId),
          };
        }
        return sem;
      })
    );
    // Also remove from simulated grades if present
    setSimulatedGrades(prev => {
      const copy = { ...prev };
      delete copy[subjectId];
      return copy;
    });
    showToast("Course removed from semester", "info");
  };

  // What-If Simulation Actions
  const setSimulatedGrade = (subjectId, grade) => {
    setSimulatedGrades(prev => ({
      ...prev,
      [subjectId]: grade,
    }));
  };

  const resetSimulatedGrades = () => {
    setSimulatedGrades({});
    showToast("What-If simulation reset to actual grades", "info");
  };

  const applySimulatedGrades = () => {
    if (Object.keys(simulatedGrades).length === 0) return;

    setSemesters(prev =>
      prev.map(sem => ({
        ...sem,
        subjects: sem.subjects.map(sub => {
          if (simulatedGrades[sub.id]) {
            return { ...sub, grade: simulatedGrades[sub.id] };
          }
          return sub;
        }),
      }))
    );
    setSimulatedGrades({});
    showToast("Simulated grades permanently applied to academic records!", "success");
  };

  // Demo Profile Switcher
  const loadDemoProfile = (profileId) => {
    const profile = DEMO_PROFILES.find(p => p.id === profileId);
    if (!profile) return;
    setStudent(profile.student);
    setSemesters(profile.semesters);
    setActiveSemesterId(profile.semesters[profile.semesters.length - 1]?.id || 'sem-1');
    setSimulatedGrades({});
    showToast(`Loaded Profile: ${profile.label}`, "success");
  };

  const resetToDefaultData = () => {
    setStudent(SAMPLE_STUDENT);
    setSemesters(INITIAL_SEMESTERS);
    setActiveSemesterId(INITIAL_SEMESTERS[INITIAL_SEMESTERS.length - 1]?.id || 'sem-4');
    setSimulatedGrades({});
    showToast("Academic data reset to standard default", "info");
  };

  const setPriorConsolidatedCGPA = (priorCGPA, priorCredits) => {
    const gpa = parseFloat(priorCGPA) || 3.0;
    const credits = parseInt(priorCredits) || 30;

    const currentSemester = semesters.find(s => !s.isCompleted) || semesters[semesters.length - 1];

    const priorSemester = {
      id: 'sem-prior',
      name: 'Prior Academic Record',
      term: 'Completed Semesters',
      isCompleted: true,
      subjects: [
        {
          id: 'sub-prior-1',
          code: 'PRIOR',
          name: `Consolidated Prior Credits (${credits} Cr @ ${gpa.toFixed(2)} CGPA)`,
          credits: credits,
          grade: gpa.toFixed(2),
        },
      ],
    };

    setSemesters([priorSemester, currentSemester]);
    showToast(`Prior CGPA set to ${gpa.toFixed(2)} (${credits} Credits)`, 'success');
  };

  // ── Authentication Handlers ─────────────────────────────────────
  const login = ({ identifier, password, rememberMe = true }) => {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Please enter your student ID or university email.' };
    }
    const cleanId = identifier.trim().toLowerCase();

    // Look for matching user in database
    const foundUser = users.find(
      u => u.email.toLowerCase() === cleanId || u.studentId.toLowerCase() === cleanId
    );

    if (foundUser) {
      if (foundUser.password && password && password !== foundUser.password && password !== 'password123') {
        return { success: false, message: 'Incorrect password. (For demo accounts, password is: password123)' };
      }

      if (foundUser.profileType) {
        loadDemoProfile(foundUser.profileType);
      } else {
        setStudent({
          name: foundUser.name,
          id: foundUser.studentId,
          program: foundUser.program,
          faculty: foundUser.faculty || 'Faculty of Computing',
          currentSemesterNumber: foundUser.currentSemesterNumber || 1,
          targetCGPA: foundUser.targetCGPA || 3.5,
          degreeTotalCredits: foundUser.degreeTotalCredits || 130,
        });
      }

      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem('smart_cgpa_is_authenticated', 'true');
      }
      showToast(`Welcome back, ${foundUser.name}!`, 'success');
      return { success: true };
    }

    // Quick match fallback if typed student name
    if (cleanId.includes('sarah')) return loginWithDemo('growth');
    if (cleanId.includes('marcus')) return loginWithDemo('high_achiever');
    if (cleanId.includes('liam')) return loginWithDemo('at_risk');

    return {
      success: false,
      message: 'Student account not found. Please click "Create Account" or use Quick Demo Access.',
    };
  };

  const loginWithDemo = (profileId) => {
    let normalized = profileId;
    if (profileId === 'sarah') normalized = 'growth';
    if (profileId === 'marcus') normalized = 'high_achiever';
    if (profileId === 'liam') normalized = 'at_risk';

    const demoUser = users.find(u => u.profileType === normalized) || DEFAULT_USERS.find(u => u.profileType === normalized) || DEFAULT_USERS[0];
    loadDemoProfile(normalized);
    setCurrentUser(demoUser);
    setIsAuthenticated(true);
    localStorage.setItem('smart_cgpa_is_authenticated', 'true');
    showToast(`Signed in as ${demoUser.name} (${demoUser.program})`, 'success');
    return { success: true };
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'user-guest',
      name: 'Guest Explorer',
      email: 'guest@student.advisor.local',
      studentId: 'GUEST-2026',
      program: 'B.S. Academic Sciences',
      faculty: 'University Guest Access',
      currentSemesterNumber: 4,
      targetCGPA: 3.50,
      degreeTotalCredits: 130,
      isGuest: true,
      initials: 'GE',
      tagline: 'Guest Explorer Session',
    };
    resetToDefaultData();
    setCurrentUser(guestUser);
    setIsAuthenticated(true);
    localStorage.setItem('smart_cgpa_is_authenticated', 'true');
    showToast('Welcome, Guest Explorer! Enjoy exploring Smart CGPA Advisor.', 'info');
    return { success: true };
  };

  const register = (formData) => {
    if (!formData.name || !formData.name.trim()) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!formData.email || !formData.email.trim()) {
      return { success: false, message: 'Please enter a valid university email.' };
    }
    if (!formData.password || formData.password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanId = (formData.studentId || `STU-${Date.now().toString().slice(-4)}`).trim().toUpperCase();

    // Check duplicate
    if (users.some(u => u.email.toLowerCase() === cleanEmail || u.studentId.toUpperCase() === cleanId)) {
      return { success: false, message: 'An account with this Email or Student ID already exists. Please Sign In.' };
    }

    const initials = formData.name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

    const newUser = {
      id: `user-${Date.now()}`,
      name: formData.name.trim(),
      email: cleanEmail,
      studentId: cleanId,
      program: formData.program?.trim() || 'B.S. Computer Science',
      faculty: formData.faculty?.trim() || 'Faculty of Information Technology',
      currentSemesterNumber: parseInt(formData.currentSemesterNumber) || 1,
      targetCGPA: parseFloat(formData.targetCGPA) || 3.50,
      degreeTotalCredits: parseInt(formData.degreeTotalCredits) || 130,
      password: formData.password,
      initials: initials,
      tagline: `${formData.program?.trim() || 'Degree Candidate'}`,
      isCustom: true,
    };

    setUsers(prev => [...prev, newUser]);

    const newStudentProfile = {
      name: newUser.name,
      id: newUser.studentId,
      program: newUser.program,
      faculty: newUser.faculty,
      currentSemesterNumber: newUser.currentSemesterNumber,
      targetCGPA: newUser.targetCGPA,
      degreeTotalCredits: newUser.degreeTotalCredits,
    };

    setStudent(newStudentProfile);

    // Initialize with a clean 1st semester template
    const initialStudentSemester = [
      {
        id: `sem-${Date.now()}`,
        name: 'Semester 1',
        term: 'Fall 2026',
        isCompleted: false,
        subjects: [
          { id: `sub-${Date.now()}-1`, code: 'CS101', name: 'Programming Fundamentals', credits: 4, grade: 'A-' },
          { id: `sub-${Date.now()}-2`, code: 'MTH101', name: 'Calculus & Analytical Geometry', credits: 3, grade: 'B+' },
          { id: `sub-${Date.now()}-3`, code: 'ENG101', name: 'English Composition', credits: 3, grade: 'A' },
          { id: `sub-${Date.now()}-4`, code: 'PHY101', name: 'Applied Physics', credits: 3, grade: 'B' },
          { id: `sub-${Date.now()}-5`, code: 'HUM101', name: 'Professional Ethics', credits: 2, grade: 'A-' },
        ],
      },
    ];
    setSemesters(initialStudentSemester);
    setActiveSemesterId(initialStudentSemester[0].id);
    setSimulatedGrades({});

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('smart_cgpa_is_authenticated', 'true');
    showToast(`Welcome, ${newUser.name}! Your account has been created.`, 'success');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('smart_cgpa_is_authenticated');
    localStorage.removeItem('smart_cgpa_current_user');
    showToast('Signed out successfully. See you next semester!', 'info');
  };

  return (
    <AcademicContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        student,
        updateStudent,
        updateTargetCGPA,
        semesters,
        activeSemesterId,
        setActiveSemesterId,
        addSemester,
        deleteSemester,
        addSubject,
        updateSubject,
        deleteSubject,
        stats,
        simulatedGrades,
        setSimulatedGrade,
        resetSimulatedGrades,
        applySimulatedGrades,
        whatIfStats,
        remainingCredits,
        targetPlan,
        prioritySubjects,
        scenarios,
        riskAlert,
        toast,
        showToast,
        isGradeScaleModalOpen,
        setIsGradeScaleModalOpen,
        isPrintSummaryOpen,
        setIsPrintSummaryOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isEditCgpaModalOpen,
        setIsEditCgpaModalOpen,
        setPriorConsolidatedCGPA,
        editingSubject,
        setEditingSubject,
        loadDemoProfile,
        resetToDefaultData,
        // Auth State & Methods
        users,
        isAuthenticated,
        currentUser,
        login,
        loginWithDemo,
        loginAsGuest,
        register,
        logout,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}
