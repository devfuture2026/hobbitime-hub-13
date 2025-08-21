import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarGrid } from '@/components/CalendarGrid';
import { TodayOverview } from '@/components/TodayOverview';
import { AreasDashboard } from '@/components/AreasDashboard';
import { AlarmPanel } from '@/components/AlarmPanel';
import { TaskModal } from '@/components/TaskModal';
import { ProjectModal } from '@/components/ProjectModal';
import { ProjectTasksModal } from '@/components/ProjectTasksModal';
import { Header } from '@/components/Header';
import { SettingsModal } from '@/components/SettingsModal';
import { addDays, startOfToday } from 'date-fns';

type ViewMode = 'calendar' | 'areas';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectTasksModalOpen, setIsProjectTasksModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [quickAddProjectId, setQuickAddProjectId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [timezone, setTimezone] = useState('America/New_York');

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Sample data - in a real app, this would come from a backend
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Learning Spanish',
      color: '#10B981',
      tasksCount: 12,
      completedTasks: 8,
      category: 'hobby' as const
    },
    {
      id: '2',
      name: 'Fitness Journey',
      color: '#F59E0B',
      tasksCount: 15,
      completedTasks: 10,
      category: 'personal' as const
    },
    {
      id: '3',
      name: 'React Development',
      color: '#3B82F6',
      tasksCount: 8,
      completedTasks: 3,
      category: 'work' as const
    }
  ]);

  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Spanish Vocabulary',
      projectId: '1',
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      duration: 1,
      color: '#10B981',
      priority: 'medium' as const,
      completed: false
    },
    {
      id: '2',
      title: 'Morning Workout',
      projectId: '2',
      startTime: new Date(new Date().setHours(7, 0, 0, 0)),
      duration: 1,
      color: '#F59E0B',
      priority: 'high' as const,
      completed: false
    }
  ]);

  const [alarms, setAlarms] = useState([
    {
      id: '1',
      time: '06:30',
      enabled: true,
      sound: 'birds',
      label: 'Morning Wake-up',
      recurring: true
    }
  ]);

  // Memoize event handlers to prevent recreation on every render
  const handleTimeSlotClick = useCallback((time: Date) => {
    setSelectedTime(time);
    setIsTaskModalOpen(true);
  }, []);

  const handleCreateTask = useCallback((task: any) => {
    setTasks(prevTasks => [...prevTasks, task]);
    // Update project task counts
    setProjects(prevProjects => prevProjects.map(project => 
      project.id === task.projectId 
        ? { ...project, tasksCount: project.tasksCount + 1 }
        : project
    ));
  }, []);

  const handleTaskUpdate = useCallback((updatedTasks: any[]) => {
    setTasks(updatedTasks);
    updateProjectCounts(updatedTasks);
  }, []);

  // Update project counts based on actual tasks - memoized to prevent recreation
  const updateProjectCounts = useCallback((currentTasks: any[]) => {
    setProjects(prevProjects => prevProjects.map(project => {
      const projectTasks = currentTasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.completed);
      return {
        ...project,
        tasksCount: projectTasks.length,
        completedTasks: completedTasks.length
      };
    }));
  }, []);

  // Update project counts when tasks change
  useEffect(() => {
    updateProjectCounts(tasks);
  }, [tasks, updateProjectCounts]);

  const handleCreateProject = useCallback((projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      tasksCount: 0,
      completedTasks: 0
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
  }, []);

  // Fix: Create handler to open project modal (not create project directly)
  const handleOpenProjectModal = useCallback(() => {
    setIsProjectModalOpen(true);
  }, []);

  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectTasksModalOpen(true);
  }, []);

  const handleQuickAddTask = useCallback((projectIdOrAreaName: string) => {
    setQuickAddProjectId(projectIdOrAreaName);
    setSelectedTime(new Date());
    setIsTaskModalOpen(true);
  }, []);

  const handleGoToToday = useCallback(() => {
    setSelectedDate(startOfToday());
  }, []);

  const handleTaskDrop = useCallback((taskId: string, newTime: Date) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, startTime: newTime }
          : task
      )
    );
  }, []);


  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setSelectedTime(null);
    setQuickAddProjectId(undefined);
  }, []);

  const handleCloseProjectModal = useCallback(() => {
    setIsProjectModalOpen(false);
  }, []);

  const handleCloseProjectTasksModal = useCallback(() => {
    setIsProjectTasksModalOpen(false);
    setSelectedProjectId(undefined);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Memoize search change handler
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Memoize date change handler
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Memoize alarm update handler
  const handleAlarmUpdate = useCallback((updatedAlarms: any[]) => {
    setAlarms(updatedAlarms);
  }, []);

  // View mode change handler
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle dark:bg-gradient-subtle">
      {/* Enhanced Header */}
      <Header
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onGoToToday={handleGoToToday}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenSettings={handleOpenSettings}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* Main Content */}
      <div className="max-w-none mx-auto py-6 px-4">
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Left Sidebar - Today's Overview (only in calendar mode) */}
          {viewMode === 'calendar' && (
            <TodayOverview
              tasks={tasks}
              projects={projects}
            />
          )}

          {/* Main Content Area */}
          {viewMode === 'calendar' ? (
            <div className="flex-1 flex flex-col pl-0">
              {/* Calendar Grid */}
              <CalendarGrid
                selectedDate={selectedDate}
                tasks={tasks}
                onTimeSlotClick={handleTimeSlotClick}
                onTaskDrop={handleTaskDrop}
                onDateChange={handleDateChange}
                currentTime={new Date()}
                alarms={alarms}
                showAlarms={true}
              />
            </div>
          ) : (
            <AreasDashboard
              tasks={tasks}
              onQuickAddTask={handleQuickAddTask}
            />
          )}

          {/* Alarm Panel (Always visible in calendar mode) */}
          {viewMode === 'calendar' && (
            <div className="w-80">
              <AlarmPanel
                alarms={alarms}
                onAlarmUpdate={handleAlarmUpdate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          onCreateTask={handleCreateTask}
          selectedTime={selectedTime}
          projects={projects}
          preselectedProjectId={quickAddProjectId}
        />
      )}

      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          onCreateProject={handleCreateProject}
        />
      )}

      {isProjectTasksModalOpen && selectedProjectId && (
        <ProjectTasksModal
          isOpen={isProjectTasksModalOpen}
          onClose={handleCloseProjectTasksModal}
          project={projects.find(p => p.id === selectedProjectId)!}
          tasks={tasks.filter(t => t.projectId === selectedProjectId)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={handleCloseSettings}
          darkMode={darkMode}
          onDarkModeToggle={setDarkMode}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />
      )}
    </div>
  );
};

export default Index;
