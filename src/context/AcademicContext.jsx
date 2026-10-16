import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SAMPLE_STUDENT, INITIAL_SEMESTERS, DEMO_PROFILES } from '../data/initialData';
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
