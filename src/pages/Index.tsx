import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CalendarGrid } from '@/components/CalendarGrid';
import { TodayOverview } from '@/components/TodayOverview';
import { AreasDashboard } from '@/components/AreasDashboard';
import { AreaDashboard } from '@/components/AreaDashboard';
import { CategoryBoard } from '@/components/CategoryBoard';
import { AlarmPanel } from '@/components/AlarmPanel';
import { TaskModal } from '@/components/TaskModal';
import { ProjectModal } from '@/components/ProjectModal';
import { ProjectTasksModal } from '@/components/ProjectTasksModal';
import { Header } from '@/components/Header';
import { SettingsModal } from '@/components/SettingsModal';
import { addDays, startOfToday } from 'date-fns';

type ViewMode = 'calendar' | 'areas' | 'area-detail' | 'category-detail';

type Task = {
  id: string;
  title: string;
  projectId: string;
  startTime: Date;
  duration: number;
  color: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  listId?: string;
  dueDate?: Date | null;
  area?: string;
  category?: string;
};

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
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [lists, setLists] = useState<Array<{ id: string; title: string; projectId: string }>>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const draggedTaskIdRef = useRef<string | null>(null);
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
      category: 'hobby' as const,
      area: 'Education',
      dueDate: null
    },
    {
      id: '2',
      name: 'Working Out',
      color: '#F59E0B',
      tasksCount: 15,
      completedTasks: 10,
      category: 'personal' as const,
      area: 'Wellness',
      dueDate: null
    },
    {
      id: '3',
      name: 'MindTrack: Otto',
      color: '#3B82F6',
      tasksCount: 8,
      completedTasks: 3,
      category: 'work' as const,
      area: 'Development',
      dueDate: new Date('2024-12-31')
    },
    {
      id: '4',
      name: 'Desktop Application',
      color: '#8B5CF6',
      tasksCount: 0,
      completedTasks: 0,
      category: 'work' as const,
      area: 'Development',
      dueDate: null
    },
    {
      id: '5',
      name: 'Web Application',
      color: '#EC4899',
      tasksCount: 0,
      completedTasks: 0,
      category: 'work' as const,
      area: 'Development',
      dueDate: null
    },
    {
      id: '6',
      name: 'Mobile Application',
      color: '#06B6D4',
      tasksCount: 0,
      completedTasks: 0,
      category: 'work' as const,
      area: 'Development',
      dueDate: null
    },
    {
      id: '7',
      name: 'CrossPlatform Application',  
      color: '#84CC16',
      tasksCount: 0,
      completedTasks: 0,
      category: 'work' as const,
      area: 'Development',
      dueDate: null
    },
    {
      id: '8',
      name: 'Household Tasks',
      color: '#6B7280',
      tasksCount: 0,
      completedTasks: 0,
      category: 'personal' as const,
      area: 'Chores',
      dueDate: null
    },
    {
      id: '9',
      name: 'Entertainment',
      color: '#F59E0B',
      tasksCount: 0,
      completedTasks: 0,
      category: 'hobby' as const,
      area: 'Leisure',
      dueDate: null
    },
    {
      id: '10',
      name: 'Spiritual Practice',
      color: '#7C3AED',
      tasksCount: 0,
      completedTasks: 0,
      category: 'personal' as const,
      area: 'Mindfulness',
      dueDate: null
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    // Wellness tasks
    {
      id: '1',
      title: 'Waking up at a consistent time',
      projectId: '2',
      startTime: new Date(new Date().setHours(6, 30, 0, 0)),
      duration: 0.5,
      color: '#F59E0B',
      priority: 'high',
      completed: false,
      area: 'Wellness'
    },
    {
      id: '2',
      title: 'Working out (squats, pushups, walks)',
      projectId: '2',
      startTime: new Date(new Date().setHours(7, 0, 0, 0)),
      duration: 1,
      color: '#F59E0B',
      priority: 'high',
      completed: false,
      area: 'Wellness'
    },
    {
      id: '3',
      title: 'Cooking (weekly grocery list, daily meals: breakfast, lunch, dinner, snacks)',
      projectId: '2',
      startTime: new Date(new Date().setHours(8, 0, 0, 0)),
      duration: 1,
      color: '#F59E0B',
      priority: 'medium',
      completed: false,
      area: 'Wellness'
    },
    {
      id: '4',
      title: 'Skin care routine',
      projectId: '2',
      startTime: new Date(new Date().setHours(22, 0, 0, 0)),
      duration: 0.5,
      color: '#F59E0B',
      priority: 'medium',
      completed: false,
      area: 'Wellness'
    },
    {
      id: '5',
      title: 'Showering',
      projectId: '2',
      startTime: new Date(new Date().setHours(21, 0, 0, 0)),
      duration: 0.5,
      color: '#F59E0B',
      priority: 'medium',
      completed: false,
      area: 'Wellness'
    },
    {
      id: '6',
      title: 'Brushing teeth',
      projectId: '2',
      startTime: new Date(new Date().setHours(22, 30, 0, 0)),
      duration: 0.25,
      color: '#F59E0B',
      priority: 'high',
      completed: false,
      area: 'Wellness'
    },
    // Education tasks
    {
      id: '7',
      title: 'Reading / Literary comprehension (with memorization practice)',
      projectId: '1',
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      duration: 1,
      color: '#10B981',
      priority: 'medium',
      completed: false,
      area: 'Education'
    },
    {
      id: '8',
      title: 'Mathematics',
      projectId: '1',
      startTime: new Date(new Date().setHours(10, 0, 0, 0)),
      duration: 1,
      color: '#10B981',
      priority: 'medium',
      completed: false,
      area: 'Education'
    },
    {
      id: '9',
      title: 'I.T. / Computer Science',
      projectId: '1',
      startTime: new Date(new Date().setHours(11, 0, 0, 0)),
      duration: 1,
      color: '#10B981',
      priority: 'medium',
      completed: false,
      area: 'Education'
    },
    {
      id: '10',
      title: 'Learn Spanish (ex. Duolingo)',
      projectId: '1',
      startTime: new Date(new Date().setHours(12, 0, 0, 0)),
      duration: 0.5,
      color: '#10B981',
      priority: 'medium',
      completed: false,
      area: 'Education'
    },
    {
      id: '11',
      title: 'Music study: guitar (songs, chords, techniques), piano practice, rapping practice',
      projectId: '1',
      startTime: new Date(new Date().setHours(19, 0, 0, 0)),
      duration: 1,
      color: '#10B981',
      priority: 'low',
      completed: false,
      area: 'Education'
    },
    // Chores tasks
    {
      id: '12',
      title: 'Taking out the trash',
      projectId: '8',
      startTime: new Date(new Date().setHours(20, 0, 0, 0)),
      duration: 0.25,
      color: '#6B7280',
      priority: 'medium',
      completed: false,
      area: 'Chores'
    },
    {
      id: '13',
      title: 'Washing the floor',
      projectId: '8',
      startTime: new Date(new Date().setHours(14, 0, 0, 0)),
      duration: 0.5,
      color: '#6B7280',
      priority: 'medium',
      completed: false,
      area: 'Chores'
    },
    {
      id: '14',
      title: 'Cleaning Ricky\'s cage',
      projectId: '8',
      startTime: new Date(new Date().setHours(15, 0, 0, 0)),
      duration: 0.5,
      color: '#6B7280',
      priority: 'medium',
      completed: false,
      area: 'Chores'
    },
    // Leisure tasks
    {
      id: '15',
      title: 'Watch anime (ex. Dr. Stone)',
      projectId: '9',
      startTime: new Date(new Date().setHours(20, 0, 0, 0)),
      duration: 1,
      color: '#F59E0B',
      priority: 'low',
      completed: false,
      area: 'Leisure'
    },
    {
      id: '16',
      title: 'Scroll Instagram',
      projectId: '9',
      startTime: new Date(new Date().setHours(13, 0, 0, 0)),
      duration: 0.5,
      color: '#F59E0B',
      priority: 'low',
      completed: false,
      area: 'Leisure'
    },
    {
      id: '17',
      title: 'Play Roblox',
      projectId: '9',
      startTime: new Date(new Date().setHours(16, 0, 0, 0)),
      duration: 1,
      color: '#F59E0B',
      priority: 'low',
      completed: false,
      area: 'Leisure'
    },
    {
      id: '18',
      title: 'Listen to music (ex. "Creep")',
      projectId: '9',
      startTime: new Date(new Date().setHours(18, 0, 0, 0)),
      duration: 0.5,
      color: '#F59E0B',
      priority: 'low',
      completed: false,
      area: 'Leisure'
    },
    // Mindfulness tasks
    {
      id: '19',
      title: 'Reading the Bible',
      projectId: '10',
      startTime: new Date(new Date().setHours(6, 0, 0, 0)),
      duration: 0.5,
      color: '#7C3AED',
      priority: 'high',
      completed: false,
      area: 'Mindfulness'
    },
    {
      id: '20',
      title: 'Collecting inspirational quotes',
      projectId: '10',
      startTime: new Date(new Date().setHours(23, 0, 0, 0)),
      duration: 0.25,
      color: '#7C3AED',
      priority: 'low',
      completed: false,
      area: 'Mindfulness'
    },
    {
      id: '21',
      title: 'Noting memorable passages from books',
      projectId: '10',
      startTime: new Date(new Date().setHours(23, 15, 0, 0)),
      duration: 0.25,
      color: '#7C3AED',
      priority: 'low',
      completed: false,
      area: 'Mindfulness'
    },
    {
      id: '22',
      title: 'Recording funny jokes',
      projectId: '10',
      startTime: new Date(new Date().setHours(23, 30, 0, 0)),
      duration: 0.25,
      color: '#7C3AED',
      priority: 'low',
      completed: false,
      area: 'Mindfulness'
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

  const handleQuickAddTask = useCallback((projectId: string) => {
    setQuickAddProjectId(projectId);
    setSelectedTime(new Date());
    setIsTaskModalOpen(true);
  }, []);

  const handleAreaSelect = useCallback((areaName: string) => {
    setSelectedArea(areaName);
    setViewMode('area-detail');
  }, []);

  const handleBackToAreas = useCallback(() => {
    setSelectedArea(null);
    setViewMode('areas');
  }, []);

  const handleCategorySelect = useCallback((projectId: string) => {
    setSelectedCategoryId(projectId);
    setViewMode('category-detail');
  }, []);

  const handleBackToArea = useCallback(() => {
    setSelectedCategoryId(null);
    setViewMode('area-detail');
  }, []);

  const handleReorderTasks = useCallback((projectId: string, sourceId: string, targetId: string) => {
    setTasks(prev => {
      const list = prev.filter(t => t.projectId === projectId);
      const others = prev.filter(t => t.projectId !== projectId);
      const sourceIdx = list.findIndex(t => t.id === sourceId);
      const targetIdx = list.findIndex(t => t.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;
      const [moved] = list.splice(sourceIdx, 1);
      list.splice(targetIdx, 0, moved);
      return [...others, ...list];
    });
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
    if (mode !== 'area-detail' && mode !== 'category-detail') {
      setSelectedArea(null);
      setSelectedCategoryId(null);
    }
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
        viewMode={viewMode as any}
        onViewModeChange={handleViewModeChange as any}
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
          ) : viewMode === 'areas' ? (
            <AreasDashboard
              tasks={tasks}
              projects={projects}
              onAreaSelect={handleAreaSelect}
            />
          ) : viewMode === 'area-detail' ? (
            selectedArea && (
              <AreaDashboard
                areaName={selectedArea}
                tasks={tasks}
                projects={projects}
                onBack={handleBackToAreas}
                onAddCategory={(areaName) => {
                  setIsProjectModalOpen(true);
                }}
                onCategorySelect={handleCategorySelect}
                onQuickAddTask={(projectId) => {
                  setQuickAddProjectId(projectId);
                  setSelectedTime(new Date());
                  setIsTaskModalOpen(true);
                }}
                onReorderCategories={(areaName, sourceId, targetId) => {
                  setProjects(prev => {
                    const cur = [...prev];
                    const sourceIdx = cur.findIndex(p => p.id === sourceId);
                    const targetIdx = cur.findIndex(p => p.id === targetId);
                    if (sourceIdx === -1 || targetIdx === -1) return prev;
                    const [moved] = cur.splice(sourceIdx, 1);
                    cur.splice(targetIdx, 0, moved);
                    return cur;
                  });
                }}
                onRenameCategory={(projectId, newName) => {
                  setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
                }}
                onDeleteCategory={(projectId) => {
                  setProjects(prev => prev.filter(p => p.id !== projectId));
                  setTasks(prev => prev.filter(t => t.projectId !== projectId));
                }}
              />
            )
          ) : (
            selectedCategoryId && (
              <CategoryBoard
                project={projects.find(p => p.id === selectedCategoryId)!}
                tasks={tasks}
                lists={lists}
                onBack={handleBackToArea}
                onAddList={(projectId, title) => setLists(prev => [...prev, { id: Date.now().toString(), title, projectId }])}
                onRenameList={(listId, newTitle) => setLists(prev => prev.map(l => l.id === listId ? { ...l, title: newTitle } : l))}
                onDeleteList={(listId) => {
                  setLists(prev => prev.filter(l => l.id !== listId));
                  setTasks(prev => prev.map(t => t.listId === listId ? { ...t, listId: undefined } : t));
                }}
                onAddTask={(listId, title) => {
                  const project = projects.find(p => p.id === selectedCategoryId)!;
                  const newTask = {
                    id: Date.now().toString(),
                    title,
                    completed: false,
                    projectId: project.id,
                    listId,
                    area: project.area,
                    category: project.name,
                    startTime: new Date(),
                    duration: 1,
                    priority: 'medium',
                    color: project.color
                  } as any;
                  setTasks(prev => [...prev, newTask]);
                }}
                onToggleTask={(taskId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t))}
                onEditTask={(taskId, changes) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...changes } : t))}
                onDeleteTask={(taskId) => setTasks(prev => prev.filter(t => t.id !== taskId))}
                onReorderWithinList={(listId, sourceId, targetId) => {
                  setTasks(prev => {
                    const list = prev.filter(t => t.listId === listId);
                    const others = prev.filter(t => t.listId !== listId);
                    const sIdx = list.findIndex(t => t.id === sourceId);
                    const tIdx = list.findIndex(t => t.id === targetId);
                    if (sIdx === -1 || tIdx === -1) return prev;
                    const [moved] = list.splice(sIdx, 1);
                    list.splice(tIdx, 0, moved);
                    return [...others, ...list];
                  });
                }}
                onMoveTaskToList={(taskId, toListId, beforeTaskId) => {
                  setTasks(prev => {
                    const updated = prev.map(t => t.id === taskId ? { ...t, listId: toListId } : t);
                    if (!beforeTaskId) return updated;
                    const list = updated.filter(t => t.listId === toListId);
                    const others = updated.filter(t => t.listId !== toListId);
                    const movingIdx = list.findIndex(t => t.id === taskId);
                    const beforeIdx = list.findIndex(t => t.id === beforeTaskId);
                    if (movingIdx === -1 || beforeIdx === -1) return updated;
                    const [moved] = list.splice(movingIdx, 1);
                    list.splice(beforeIdx, 0, moved);
                    return [...others, ...list];
                  });
                }}
              />
            )
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
          areaFilter={viewMode === 'area-detail' ? selectedArea ?? undefined : undefined}
        />
      )}

      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          onCreateProject={handleCreateProject}
          lockedArea={selectedArea || undefined}
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

