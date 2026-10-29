'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <-- 1. Use Next.js router instead of react-router-dom
import { 
  Plus, 
  Check, 
  Trash2, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  RefreshCw,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';

// Color theme definitions matching the minimalist pastel UI from the design screenshot
const COLOR_THEMES = [
  { id: 'blue', name: 'Soft Blue', bg: 'bg-indigo-50/80 hover:bg-indigo-100/80', border: 'border-indigo-100', dot: 'bg-indigo-500', text: 'text-indigo-900', durationBg: 'bg-indigo-100/60', badgeText: 'text-indigo-600' },
  { id: 'purple', name: 'Lavender', bg: 'bg-fuchsia-50/80 hover:bg-fuchsia-100/80', border: 'border-fuchsia-100', dot: 'bg-fuchsia-500', text: 'text-fuchsia-900', durationBg: 'bg-fuchsia-100/60', badgeText: 'text-fuchsia-600' },
  { id: 'green', name: 'Pastel Mint', bg: 'bg-emerald-50/80 hover:bg-emerald-100/80', border: 'border-emerald-100', dot: 'bg-emerald-400', text: 'text-emerald-900', durationBg: 'bg-emerald-100/60', badgeText: 'text-emerald-600' },
  { id: 'amber', name: 'Peach Amber', bg: 'bg-amber-50/80 hover:bg-amber-100/80', border: 'border-amber-100', dot: 'bg-amber-400', text: 'text-amber-900', durationBg: 'bg-amber-100/60', badgeText: 'text-amber-600' },
  { id: 'rose', name: 'Soft Rose', bg: 'bg-rose-50/80 hover:bg-rose-100/80', border: 'border-rose-100', dot: 'bg-rose-400', text: 'text-rose-900', durationBg: 'bg-rose-100/60', badgeText: 'text-rose-600' }
];

const TIME_SLOTS = [
  '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export default function App() {
  const router = useRouter(); // <-- 2. Initialize Next.js router

  // State to manage views: 'splash', 'calendar'
  const [currentView, setCurrentView] = useState('splash');

  // Calendar states
  const [selectedDate, setSelectedDate] = useState({ day: 26, month: 'Dec', dayName: 'THU' });
  const [dates] = useState([
    { day: 25, month: 'Dec', dayName: 'WED' },
    { day: 26, month: 'Dec', dayName: 'THU' },
    { day: 27, month: 'Dec', dayName: 'FRI' },
    { day: 28, month: 'Dec', dayName: 'SAT' },
    { day: 29, month: 'Dec', dayName: 'SUN' },
    { day: 30, month: 'Dec', dayName: 'MON' },
  ]);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formTitle, setFormTitle] = useState('');
  const [formTimeSlot, setFormTimeSlot] = useState('6:00');
  const [formDuration, setFormDuration] = useState('1h');
  const [formColor, setFormColor] = useState('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDummyJSONTodos();
  }, []);

  const fetchDummyJSONTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://dummyjson.com/todos?limit=10');
      if (!response.ok) throw new Error('Failed to fetch data from DummyJSON API');
      const data = await response.json();

      const defaultSlots = ['6:00', '9:00', '10:00', '14:00', '16:00', '18:00'];
      const defaultDurations = ['1h', '1h', '4h', '2h', '1.5h', '30m'];
      const defaultColors = ['blue', 'purple', 'green', 'amber', 'rose'];

      const screenshotTasks = [
        { id: 'custom-1', todo: 'Drink 8 glasses of water', completed: false, timeSlot: '6:00', duration: '1h', color: 'blue', day: 26, month: 'Dec' },
        { id: 'custom-2', todo: 'Get a notebook', completed: false, timeSlot: '9:00', duration: '1h', color: 'purple', day: 26, month: 'Dec' },
        { id: 'custom-3', todo: 'Work', completed: false, timeSlot: '10:00', duration: '4h', color: 'green', day: 26, month: 'Dec' }
      ];

      const apiMappedTasks = data.todos.map((item, index) => ({
        id: item.id,
        todo: item.todo,
        completed: item.completed,
        userId: item.userId,
        timeSlot: defaultSlots[index % defaultSlots.length],
        duration: defaultDurations[index % defaultDurations.length],
        color: defaultColors[index % defaultColors.length],
        day: 26 + (index % 3) - 1,
        month: 'Dec'
      }));

      setTasks([...screenshotTasks, ...apiMappedTasks]);
    } catch (err) {
      console.error('Error fetching DummyJSON todos:', err);
      setError('Could not connect to DummyJSON API. Using fallback offline state.');
      setTasks([
        { id: 101, todo: 'Drink 8 glasses of water', completed: false, timeSlot: '6:00', duration: '1h', color: 'blue', day: 26, month: 'Dec' },
        { id: 102, todo: 'Get a notebook', completed: false, timeSlot: '9:00', duration: '1h', color: 'purple', day: 26, month: 'Dec' },
        { id: 103, todo: 'Work', completed: false, timeSlot: '10:00', duration: '4h', color: 'green', day: 26, month: 'Dec' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = (presetSlot = '6:00') => {
    setEditingTask(null);
    setFormTitle('');
    setFormTimeSlot(presetSlot);
    setFormDuration('1h');
    setFormColor('blue');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task, e) => {
    e.stopPropagation();
    setEditingTask(task);
    setFormTitle(task.todo);
    setFormTimeSlot(task.timeSlot || '6:00');
    setFormDuration(task.duration || '1h');
    setFormColor(task.color || 'blue');
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        todo: formTitle,
        timeSlot: formTimeSlot,
        duration: formDuration,
        color: formColor
      } : t));
    } else {
      const newTaskObj = {
        id: Date.now(),
        todo: formTitle,
        completed: false,
        timeSlot: formTimeSlot,
        duration: formDuration,
        color: formColor,
        day: selectedDate.day,
        month: selectedDate.month
      };
      setTasks(prev => [newTaskObj, ...prev]);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleToggleComplete = async (taskId, e) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesDate = (task.day === selectedDate.day) || (!task.day && selectedDate.day === 26);
    const matchesSearch = task.todo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesDate || !matchesSearch) return false;
    if (filterMode === 'completed') return task.completed;
    if (filterMode === 'pending') return !task.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex justify-center py-0 sm:py-8 px-0 sm:px-4 font-sans antialiased">
      <div className="w-full max-w-md bg-white sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-slate-100 flex flex-col overflow-hidden min-h-screen sm:min-h-[850px] relative">
        
        {/* VIEW 1: SPLASH SCREEN */}
        {currentView === 'splash' && (
          <div className="flex-1 flex flex-col justify-between p-6 relative overflow-hidden bg-[#F4F9F9]">
            {/* Background decorative soft circles */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-teal-100/60 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar / Status Bar Mock */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 z-10 pt-2">
              <span>9:30 PM</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="text-[10px]">|||</span>
                <span className="text-[10px]">🛜</span>
                <span className="text-[10px]">🔋</span>
              </div>
            </div>

            {/* Illustration Area */}
            <div className="my-auto flex flex-col items-center z-10 py-8">
              <div className="relative w-full max-w-[260px] h-[220px] flex items-center justify-center">
                {/* Minimalist vector illustration layout matching the screenshot */}
                <div className="absolute left-6 bottom-4 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-800 font-bold mb-1">
                    👤
                  </div>
                  <div className="w-10 h-3 bg-slate-300 rounded-full opacity-40 mt-1" />
                </div>

                {/* Floating Task Cards */}
                <div className="absolute right-2 top-2 bg-white p-3 rounded-xl shadow-lg border border-slate-100 w-32 animate-pulse">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-4 h-4 bg-teal-400 rounded-sm" />
                    <span className="text-[10px] bg-teal-100 text-teal-700 px-1 rounded">✓</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-100 rounded" />
                    <div className="w-3/4 h-2 bg-slate-100 rounded" />
                  </div>
                </div>

                <div className="absolute right-16 top-24 bg-white p-3 rounded-xl shadow-md border border-slate-100 w-28">
                  <div className="flex justify-end mb-1">
                    <span className="text-[10px] text-slate-400">✓</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-100 rounded" />
                    <div className="w-1/2 h-2 bg-slate-100 rounded" />
                  </div>
                </div>

                <div className="absolute right-4 bottom-2 bg-white p-3 rounded-xl shadow-md border border-slate-100 w-28">
                  <div className="flex justify-end mb-1">
                    <span className="text-[10px] text-slate-400">✓</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-100 rounded" />
                    <div className="w-2/3 h-2 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>

              {/* Text Information */}
              <div className="text-center mt-6 px-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Gets things with TODs
                </h1>
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed max-w-[280px] mx-auto">
                  Lorem ipsum dolor sit amet consectetur. Eget sit nec et euismod. Consequat urna quam felis interdum quisque. Malesuada adipiscing tristique ut eget sed.
                </p>
              </div>
            </div>

            {/* Bottom Button Action */}
            <div className="z-10 pb-4">
              <button
                onClick={() => {
                  router.push('/register'); // <-- 3. Push to your register folder using Next.js router
                }}
                className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: CALENDAR & TODO APP (Accessible if toggled or tested) */}
        {currentView === 'calendar' && (
          <div className="flex flex-col h-full bg-white flex-1">
            <div className="pt-6 px-6 pb-4 bg-white sticky top-0 z-20 border-b border-slate-50/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentView('splash')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-semibold"
                  >
                    ← Back
                  </button>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    Calendar <span className="text-slate-400 font-normal">{selectedDate.day} {selectedDate.month}</span>
                  </h1>
                </div>
                
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Horizontal Calendar Bar */}
              <div className="grid grid-cols-6 gap-2 my-2">
                {dates.map((item) => {
                  const isSelected = selectedDate.day === item.day;
                  return (
                    <button
                      key={item.day}
                      onClick={() => setSelectedDate(item)}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-200 border ${
                        isSelected
                          ? 'border-slate-800 bg-white text-slate-900 shadow-sm ring-1 ring-slate-800'
                          : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] font-bold tracking-wider uppercase mb-0.5">
                        {item.dayName}
                      </span>
                      <span className="text-base font-semibold">
                        {item.day}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Filter Bar */}
              <div className="mt-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                
                <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
                  <button onClick={() => setFilterMode('all')} className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'all' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500'}`}>All</button>
                  <button onClick={() => setFilterMode('pending')} className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'pending' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500'}`}>Todo</button>
                  <button onClick={() => setFilterMode('completed')} className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'completed' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500'}`}>Done</button>
                </div>
              </div>
            </div>

            {/* Schedule View */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {error && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-between mb-2">
                  <span>{error}</span>
                  <button onClick={fetchDummyJSONTodos} className="underline text-amber-900 font-bold ml-2">Retry</button>
                </div>
              )}

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <RefreshCw className="w-7 h-7 animate-spin text-slate-600" />
                  <p className="text-xs font-medium tracking-wide">Syncing tasks from DummyJSON...</p>
                </div>
              ) : (
                <>
                  {TIME_SLOTS.map((time) => {
                    const tasksInSlot = filteredTasks.filter(t => t.timeSlot === time);

                    return (
                      <div key={time} className="flex gap-4 items-start min-h-[52px] group">
                        <div className="w-12 text-xs font-normal text-slate-400 pt-2 text-left shrink-0">
                          {time}
                        </div>

                        <div className="flex-1 relative pt-1 min-h-[48px]">
                          {tasksInSlot.length === 0 && (
                            <div 
                              onClick={() => handleOpenCreateModal(time)}
                              className="w-full h-full min-h-[42px] rounded-2xl border border-dashed border-transparent hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-pointer flex items-center px-3"
                            >
                              <span className="text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add event at {time}
                              </span>
                            </div>
                          )}

                          <div className="space-y-2">
                            {tasksInSlot.map((task) => {
                              const theme = COLOR_THEMES.find(c => c.id === task.color) || COLOR_THEMES[0];
                              
                              return (
                                <div
                                  key={task.id}
                                  onClick={(e) => handleOpenEditModal(task, e)}
                                  className={`w-full p-4 rounded-2xl transition-all duration-200 border ${theme.bg} ${theme.border} cursor-pointer shadow-sm hover:shadow-md group/card relative overflow-hidden`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 pr-2 flex-1 min-w-0">
                                      <button
                                        onClick={(e) => handleToggleComplete(task.id, e)}
                                        className="p-1 rounded-full hover:bg-black/5 transition-all text-slate-400 hover:text-slate-700"
                                      >
                                        {task.completed ? (
                                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                        ) : (
                                          <div className={`w-3.5 h-3.5 rounded-full ${theme.dot} ring-4 ring-white/60`} />
                                        )}
                                      </button>

                                      <span className={`text-sm font-semibold truncate ${theme.text} ${task.completed ? 'line-through opacity-50' : ''}`}>
                                        {task.todo}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {task.duration && (
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${theme.durationBg} ${theme.badgeText}`}>
                                          {task.duration}
                                        </span>
                                      )}
                                      <button
                                        onClick={(e) => handleDeleteTask(task.id, e)}
                                        className="opacity-0 group-hover/card:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white/60 transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}