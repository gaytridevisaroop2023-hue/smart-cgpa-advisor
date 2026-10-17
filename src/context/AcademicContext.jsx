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

export const getUserCoursesKey = (userId) => `smart_cgpa_user_courses_${userId}`;
export const getUserProfileKey = (userId) => `smart_cgpa_user_profile_${userId}`;

export const BLANK_STUDENT = {
  name: '',
  id: '',
  program: '',
  faculty: '',
  currentSemesterNumber: 1,
  targetCGPA: 3.50,
  degreeTotalCredits: 130,
};

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
    const isAuth = localStorage.getItem('smart_cgpa_is_authenticated') === 'true';
    const savedUser = localStorage.getItem('smart_cgpa_current_user');
    return Boolean(isAuth && savedUser);
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const isAuth = localStorage.getItem('smart_cgpa_is_authenticated') === 'true';
      const saved = localStorage.getItem('smart_cgpa_current_user');
      if (isAuth && saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Student Profile - strictly isolated to current authenticated user
  const [student, setStudent] = useState(() => {
    const isAuth = localStorage.getItem('smart_cgpa_is_authenticated') === 'true';
    const savedUserStr = localStorage.getItem('smart_cgpa_current_user');
    if (isAuth && savedUserStr) {
      try {
        const user = JSON.parse(savedUserStr);
        const savedProfile = localStorage.getItem(getUserProfileKey(user.id));
        if (savedProfile) return JSON.parse(savedProfile);
        return {
          name: user.name,
          id: user.studentId,
          program: user.program,
          faculty: user.faculty || 'Faculty of Computing & IT',
          currentSemesterNumber: user.currentSemesterNumber || 1,
          targetCGPA: user.targetCGPA || 3.50,
          degreeTotalCredits: user.degreeTotalCredits || 130,
        };
      } catch {
        return BLANK_STUDENT;
      }
    }
    return BLANK_STUDENT;
  });

  // Semesters Data - strictly isolated to current authenticated user
  const [semesters, setSemesters] = useState(() => {
    const isAuth = localStorage.getItem('smart_cgpa_is_authenticated') === 'true';
    const savedUserStr = localStorage.getItem('smart_cgpa_current_user');
    if (isAuth && savedUserStr) {
      try {
        const user = JSON.parse(savedUserStr);
        const savedCourses = localStorage.getItem(getUserCoursesKey(user.id));
        if (savedCourses) return JSON.parse(savedCourses);
        if (user.profileType) {
          const demo = DEMO_PROFILES.find(p => p.id === user.profileType);
          if (demo) return demo.semesters;
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Currently Selected Semester for details/editor
  const [activeSemesterId, setActiveSemesterId] = useState(() => {
    return semesters[semesters.length - 1]?.id || 'sem-1';
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

  // Save users database
  useEffect(() => {
    localStorage.setItem('smart_cgpa_users_db', JSON.stringify(users));
  }, [users]);

  // Save current user's profile to their private isolated key
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.id && student && student.name) {
      localStorage.setItem(getUserProfileKey(currentUser.id), JSON.stringify(student));
    }
  }, [student, isAuthenticated, currentUser]);

  // Save current user's courses to their private isolated key
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.id && Array.isArray(semesters)) {
      localStorage.setItem(getUserCoursesKey(currentUser.id), JSON.stringify(semesters));
    }
  }, [semesters, isAuthenticated, currentUser]);

  // Update session markers
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem('smart_cgpa_is_authenticated', 'true');
      localStorage.setItem('smart_cgpa_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smart_cgpa_is_authenticated');
      localStorage.removeItem('smart_cgpa_current_user');
      // Clean up any legacy shared data keys so they never leak
      localStorage.removeItem('smart_cgpa_student');
      localStorage.removeItem('smart_cgpa_semesters');
    }
  }, [isAuthenticated, currentUser]);

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

  // Reset current student courses to their starter template
  const resetCurrentUserCourses = () => {
    if (!currentUser) return;
    if (currentUser.profileType) {
      const demo = DEMO_PROFILES.find(p => p.id === currentUser.profileType);
      if (demo) {
        setSemesters(demo.semesters);
        setActiveSemesterId(demo.semesters[demo.semesters.length - 1]?.id || 'sem-1');
        setSimulatedGrades({});
        showToast('Courses reset to default template', 'info');
        return;
      }
    }
    const cleanSem = [
      {
        id: `sem-${Date.now()}`,
        name: 'Semester 1',
        term: 'Current Term',
        isCompleted: false,
        subjects: [],
      },
    ];
    setSemesters(cleanSem);
    setActiveSemesterId(cleanSem[0].id);
    setSimulatedGrades({});
    showToast('Your courses have been cleared', 'info');
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

  // ── Authentication Handlers (Isolated Per-Student) ──────────────
  const login = ({ identifier, password, rememberMe = true }) => {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Please enter your student ID or university email.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your account password.' };
    }

    const cleanId = identifier.trim().toLowerCase();

    // Look for matching user in user database
    const foundUser = users.find(
      u => u.email.toLowerCase() === cleanId || u.studentId.toLowerCase() === cleanId
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'No student account matches this ID or Email. Please create an account in the "Create Account" tab.',
      };
    }

    // STRICT Password Validation: Must match the account password
    if (foundUser.password !== password) {
      return {
        success: false,
        message: 'Incorrect password for this student account. Please verify your password.',
      };
    }

    // Load isolated profile for this user
    const userProfileKey = getUserProfileKey(foundUser.id);
    const userCoursesKey = getUserCoursesKey(foundUser.id);

    let userProfile = null;
    const savedProfile = localStorage.getItem(userProfileKey);
    if (savedProfile) {
      try { userProfile = JSON.parse(savedProfile); } catch {}
    }
    if (!userProfile) {
      userProfile = {
        name: foundUser.name,
        id: foundUser.studentId,
        program: foundUser.program,
        faculty: foundUser.faculty || 'Faculty of Computing & IT',
        currentSemesterNumber: foundUser.currentSemesterNumber || 1,
        targetCGPA: foundUser.targetCGPA || 3.50,
        degreeTotalCredits: foundUser.degreeTotalCredits || 130,
      };
      localStorage.setItem(userProfileKey, JSON.stringify(userProfile));
    }
    setStudent(userProfile);

    // Load isolated courses for this user
    let userCourses = null;
    const savedCourses = localStorage.getItem(userCoursesKey);
    if (savedCourses) {
      try { userCourses = JSON.parse(savedCourses); } catch {}
    }
    if (!userCourses) {
      if (foundUser.profileType) {
        const demo = DEMO_PROFILES.find(p => p.id === foundUser.profileType);
        if (demo) userCourses = demo.semesters;
      }
      if (!userCourses) {
        userCourses = [
          {
            id: `sem-${Date.now()}`,
            name: 'Semester 1',
            term: 'Current Term',
            isCompleted: false,
            subjects: [],
          },
        ];
      }
      localStorage.setItem(userCoursesKey, JSON.stringify(userCourses));
    }

    setSemesters(userCourses);
    setActiveSemesterId(userCourses[userCourses.length - 1]?.id || 'sem-1');
    setSimulatedGrades({});

    setCurrentUser(foundUser);
    setIsAuthenticated(true);

    if (rememberMe) {
      localStorage.setItem('smart_cgpa_is_authenticated', 'true');
      localStorage.setItem('smart_cgpa_current_user', JSON.stringify(foundUser));
    }

    showToast(`Welcome back, ${foundUser.name}! Your private courses vault is open.`, 'success');
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
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanId = (formData.studentId || `STU-${Date.now().toString().slice(-4)}`).trim().toUpperCase();

    // Check duplicate
    if (users.some(u => u.email.toLowerCase() === cleanEmail || u.studentId.toUpperCase() === cleanId)) {
      return { success: false, message: 'An account with this Email or Student ID already exists. Please Sign In.' };
    }

    const initials = formData.name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: formData.name.trim(),
      email: cleanEmail,
      studentId: cleanId,
      program: formData.program?.trim() || 'B.S. Computer Science',
      faculty: formData.faculty?.trim() || 'Faculty of Computing & IT',
      currentSemesterNumber: parseInt(formData.currentSemesterNumber) || 1,
      targetCGPA: parseFloat(formData.targetCGPA) || 3.50,
      degreeTotalCredits: parseInt(formData.degreeTotalCredits) || 130,
      password: formData.password,
      initials: initials,
      tagline: `${formData.program?.trim() || 'Degree Candidate'}`,
      isCustom: true,
    };

    // Save in user list
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('smart_cgpa_users_db', JSON.stringify(updatedUsers));

    // Save new student's private profile
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
    localStorage.setItem(getUserProfileKey(newUser.id), JSON.stringify(newStudentProfile));

    // Initialize clean private semester for this student
    const newStudentSemesters = [
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
        ],
      },
    ];
    setSemesters(newStudentSemesters);
    setActiveSemesterId(newStudentSemesters[0].id);
    localStorage.setItem(getUserCoursesKey(newUser.id), JSON.stringify(newStudentSemesters));

    setSimulatedGrades({});
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('smart_cgpa_is_authenticated', 'true');
    localStorage.setItem('smart_cgpa_current_user', JSON.stringify(newUser));

    showToast(`Welcome, ${newUser.name}! Your private courses vault is created.`, 'success');
    return { success: true };
  };

  const logout = () => {
    // If user was logged in, ensure their latest edits are safely persisted to their private key
    if (currentUser && currentUser.id) {
      if (Array.isArray(semesters)) {
        localStorage.setItem(getUserCoursesKey(currentUser.id), JSON.stringify(semesters));
      }
      if (student && student.name) {
        localStorage.setItem(getUserProfileKey(currentUser.id), JSON.stringify(student));
      }
    }

    // Wipe in-memory active state so courses are never seen by anyone else
    setIsAuthenticated(false);
    setCurrentUser(null);
    setStudent(BLANK_STUDENT);
    setSemesters([]);
    setSimulatedGrades({});

    localStorage.removeItem('smart_cgpa_is_authenticated');
    localStorage.removeItem('smart_cgpa_current_user');

    // Remove legacy shared keys
    localStorage.removeItem('smart_cgpa_student');
    localStorage.removeItem('smart_cgpa_semesters');

    showToast('Signed out successfully. Your courses are locked and saved.', 'info');
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
        resetCurrentUserCourses,
        // Auth State & Methods
        users,
        isAuthenticated,
        currentUser,
        login,
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
