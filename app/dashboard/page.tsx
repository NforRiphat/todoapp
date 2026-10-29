"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

/* =========================================
   1. TYPES & CONSTANTS
   ========================================= */

interface Task {
  id: number | string;
  todo: string;
  completed: boolean;
}

interface SessionUser {
  fullName: string;
  email: string;
}

// Preset tasks for the initial design match
const INITIAL_DUMMY_TASKS: Task[] = [
  { id: "dummy-1", todo: "Learning Programming by 12PM", completed: true },
  { id: "dummy-2", todo: "Learn how to cook by 1PM", completed: false },
  { id: "dummy-3", todo: "Learn how to play at 2PM", completed: false },
  { id: "dummy-4", todo: "Have lunch at 4PM", completed: false },
  { id: "dummy-5", todo: "Going to travel 6PM", completed: false },
];

export default function DashboardPage() {
  const router = useRouter();
  
  // State
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "completed">("all");

  /* =========================================
     2. INITIALIZATION & CLOCK
     ========================================= */
  useEffect(() => {
    setMounted(true);
    
    // Get user session
    const sessionStr = localStorage.getItem("onboard_current_user");
    if (!sessionStr) {
      router.push("/login");
    } else {
      setUser(JSON.parse(sessionStr));
    }

    // Start live clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  /* =========================================
     3. FETCH DUMMYJSON API
     ========================================= */
  useEffect(() => {
    async function fetchTodos() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("https://dummyjson.com/todos?limit=5");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        
        const data = await res.json();
        
        // Map API response to our Task interface
        const apiTasks: Task[] = data.todos.map((t: any) => ({
          id: t.id,
          todo: t.todo,
          completed: t.completed,
        }));

        // Combine with our specific design preset tasks
        setTasks([...INITIAL_DUMMY_TASKS, ...apiTasks]);
      } catch (err) {
        console.error(err);
        setError("Could not connect to server. Showing offline tasks.");
        // Fallback to design tasks if API fails
        setTasks(INITIAL_DUMMY_TASKS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTodos();
  }, []);

  /* =========================================
     4. CRUD HANDLERS
     ========================================= */

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isAdding) return; // Prevent empty submissions

    setIsAdding(true);
    const tempId = `new-${Date.now()}`;
    const newTask: Task = { id: tempId, todo: newTaskTitle.trim(), completed: false };

    // Optimistically update UI immediately
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");

    try {
      const res = await fetch("https://dummyjson.com/todos/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo: newTask.todo, completed: false, userId: 5 }),
      });
      const data = await res.json();
      
      // Replace temp ID with real API ID
      setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: data.id } : t)));
    } catch (err) {
      console.log("Failed to save to API, kept locally.");
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (id: number | string, completed: boolean) => {
    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    );

    try {
      await fetch(`https://dummyjson.com/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
    } catch (err) {
      console.log("API sync failed, UI remains updated.");
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: number | string) => {
    // Optimistic UI Update
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`https://dummyjson.com/todos/${id}`, { method: "DELETE" });
    } catch (err) {
      console.log("API sync failed, UI remains updated.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("onboard_current_user");
    router.push("/login");
  };

  /* =========================================
     5. FILTERING LOGIC
     ========================================= */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search match
      const matchesSearch = task.todo.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filter match
      if (filterMode === "active") return !task.completed;
      if (filterMode === "completed") return task.completed;
      return true; // "all"
    });
  }, [tasks, searchQuery, filterMode]);

  /* =========================================
     6. RENDER HELPERS
     ========================================= */
  
  // Clock angles
  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  // Greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!mounted || !user) return null;

  return (
    <main className="db-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ───────────── HEADER SECTION ───────────── */}
      <div className="db-header-bg">
        {/* Decorative Circles */}
        <div className="db-circle-large"></div>
        <div className="db-circle-small"></div>

        <div className="db-header-content">
          <div className="db-avatar-wrapper">
            {/* Using a beautiful silhouette image from Unsplash */}
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
              alt="User Avatar" 
              className="db-avatar"
            />
          </div>
          <h1 className="db-welcome-text">Welcome {user.fullName.split(" ")[0] || "User"}</h1>
          
          {/* Logout button (nice to have) */}
          <button onClick={handleLogout} className="db-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* ───────────── BODY SECTION ───────────── */}
      <div className="db-body">
        
        {/* Time & Greeting Row */}
        <div className="db-time-row">
          <div className="db-greeting">{getGreeting()}</div>
          <div className="db-clock">
            <div className="db-clock-face">
              {/* Numbers */}
              <span className="db-num db-num-12">12</span>
              <span className="db-num db-num-3">3</span>
              <span className="db-num db-num-6">6</span>
              <span className="db-num db-num-9">9</span>
              {/* Hands */}
              <div className="db-hand db-hour" style={{ transform: `rotate(${hourDeg}deg)` }}></div>
              <div className="db-hand db-minute" style={{ transform: `rotate(${minuteDeg}deg)` }}></div>
              <div className="db-hand db-second" style={{ transform: `rotate(${secondDeg}deg)` }}></div>
              <div className="db-center-dot"></div>
            </div>
          </div>
        </div>

        {/* Task List Header */}
        <h2 className="db-section-title">Task list</h2>

        {/* Main Task Card */}
        <div className="db-card">
          
          <div className="db-card-header">
            <span className="db-card-title">Daily Task</span>
            <button className="db-add-icon-btn" onClick={() => document.getElementById("newTaskInput")?.focus()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#53C8C1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          {/* Toolbar (Search + Filters) */}
          <div className="db-toolbar">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="db-search-input"
            />
            <div className="db-filters">
              {(["all", "active", "completed"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`db-filter-btn ${filterMode === mode ? "active" : ""}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Status Messages */}
          {error && <div className="db-error-msg">{error}</div>}
          
          {/* Task List */}
          <div className="db-list-container">
            {isLoading ? (
              <div className="db-loading">
                <div className="db-spinner"></div>
                <span>Loading tasks...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="db-empty">
                No tasks found. Add a new task below!
              </div>
            ) : (
              <ul className="db-task-list">
                {filteredTasks.map((task) => (
                  <li key={task.id} className="db-task-item">
                    <label className="db-task-label">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id, task.completed)}
                        className="db-checkbox"
                      />
                      <span className={`db-task-text ${task.completed ? "completed" : ""}`}>
                        {task.todo}
                      </span>
                    </label>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="db-delete-btn"
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Add New Task Form */}
          <form onSubmit={handleAddTask} className="db-add-form">
            <input
              id="newTaskInput"
              type="text"
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="db-add-input"
              disabled={isAdding}
            />
            <button type="submit" className="db-add-submit" disabled={!newTaskTitle.trim() || isAdding}>
              {isAdding ? "..." : "Add"}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}

/* =========================================
   7. CSS STYLES
   ========================================= */

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

  .db-page {
    font-family: 'Poppins', system-ui, -apple-system, sans-serif;
    background-color: #F8F9FA;
    min-height: 100vh;
    color: #0F172A;
    display: flex;
    flex-direction: column;
  }

  .db-page * { box-sizing: border-box; }

  /* ─────── HEADER ─────── */
  .db-header-bg {
    background-color: #53C8C1;
    padding: 40px 24px 30px;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .db-circle-large {
    position: absolute;
    top: -80px;
    left: -80px;
    width: 280px;
    height: 280px;
    background-color: #8EE3D9;
    border-radius: 50%;
    opacity: 0.6;
    mix-blend-mode: multiply;
  }

  .db-circle-small {
    position: absolute;
    top: 40px;
    left: 60px;
    width: 180px;
    height: 180px;
    background-color: #7DD3C9;
    border-radius: 50%;
    opacity: 0.7;
    mix-blend-mode: multiply;
  }

  .db-header-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 400px;
  }

  .db-avatar-wrapper {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    margin-bottom: 16px;
    background-color: #fff;
  }

  .db-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .db-welcome-text {
    color: #FFFFFF;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    letter-spacing: 0.5px;
  }

  .db-logout-btn {
    position: absolute;
    top: -10px;
    right: 0;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .db-logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* ─────── BODY ─────── */
  .db-body {
    flex: 1;
    padding: 24px;
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
  }

  /* Clock & Greeting */
  .db-time-row {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-bottom: 32px;
  }

  .db-greeting {
    font-size: 14px;
    font-weight: 600;
    color: #1E293B;
    margin-bottom: 12px;
    padding-right: 12px;
  }

  .db-clock {
    width: 110px;
    height: 110px;
    background: #E6F4F1;
    border-radius: 50%;
    box-shadow: inset 0 4px 8px rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.05);
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
  }

  .db-clock-face {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .db-num {
    position: absolute;
    font-size: 10px;
    font-weight: 600;
    color: #14B8A6;
  }
  .db-num-12 { top: 8px; left: 50%; transform: translateX(-50%); }
  .db-num-3 { right: 8px; top: 50%; transform: translateY(-50%); }
  .db-num-6 { bottom: 8px; left: 50%; transform: translateX(-50%); }
  .db-num-9 { left: 8px; top: 50%; transform: translateY(-50%); }

  .db-hand {
    position: absolute;
    background-color: #14B8A6;
    border-radius: 4px;
    transform-origin: bottom center;
    left: 50%;
    bottom: 50%;
  }

  .db-hour {
    width: 3px;
    height: 28px;
    margin-left: -1.5px;
    background-color: #64748B;
  }

  .db-minute {
    width: 2px;
    height: 38px;
    margin-left: -1px;
    background-color: #14B8A6;
  }

  .db-second {
    width: 1.5px;
    height: 42px;
    margin-left: -0.75px;
    background-color: #53C8C1;
  }

  .db-center-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: #14B8A6;
    border-radius: 50%;
    z-index: 10;
  }

  /* Section Title */
  .db-section-title {
    font-size: 18px;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 16px;
  }

  /* ─────── CARD ─────── */
  .db-card {
    background-color: #FFFFFF;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
  }

  .db-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .db-card-title {
    font-size: 15px;
    font-weight: 500;
    color: #64748B;
  }

  .db-add-icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }
  .db-add-icon-btn:hover {
    transform: scale(1.1);
  }

  /* Toolbar */
  .db-toolbar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 16px;
  }

  .db-search-input {
    width: 100%;
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .db-search-input:focus {
    border-color: #53C8C1;
  }

  .db-filters {
    display: flex;
    gap: 8px;
  }

  .db-filter-btn {
    flex: 1;
    padding: 8px 0;
    border: none;
    background-color: #F8FAFC;
    color: #64748B;
    font-size: 12px;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .db-filter-btn.active {
    background-color: #53C8C1;
    color: white;
  }

  /* List */
  .db-list-container {
    min-height: 150px;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 4px;
    margin-bottom: 16px;
  }

  .db-list-container::-webkit-scrollbar {
    width: 4px;
  }
  .db-list-container::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 4px;
  }

  .db-loading, .db-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 150px;
    color: #94A3B8;
    font-size: 13px;
    gap: 12px;
  }

  .db-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #F1F5F9;
    border-top-color: #53C8C1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .db-task-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .db-task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 8px;
    padding-right: 8px;
  }

  .db-task-label {
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    flex: 1;
  }

  .db-checkbox {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid #0F172A;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .db-checkbox:checked {
    background-color: #53C8C1;
    border-color: #0F172A;
  }

  .db-checkbox:checked::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid #0F172A;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .db-task-text {
    font-size: 14px;
    font-weight: 500;
    color: #0F172A;
    transition: color 0.2s, text-decoration 0.2s;
  }

  .db-task-text.completed {
    text-decoration: line-through;
    color: #94A3B8;
  }

  .db-delete-btn {
    background: none;
    border: none;
    color: #CBD5E1;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    transition: color 0.2s;
  }
  .db-delete-btn:hover {
    color: #EF4444;
  }

  /* Add Form */
  .db-add-form {
    display: flex;
    gap: 8px;
    margin-top: auto;
    border-top: 1px solid #F1F5F9;
    padding-top: 16px;
  }

  .db-add-input {
    flex: 1;
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    font-size: 13px;
    outline: none;
    font-family: inherit;
  }

  .db-add-input:focus {
    border-color: #53C8C1;
  }

  .db-add-submit {
    padding: 10px 20px;
    background-color: #0F172A;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .db-add-submit:hover:not(:disabled) {
    background-color: #1E293B;
  }
  .db-add-submit:disabled {
    background-color: #CBD5E1;
    cursor: not-allowed;
  }

  .db-error-msg {
    background-color: #FEF2F2;
    color: #B91C1C;
    padding: 10px;
    border-radius: 8px;
    font-size: 12px;
    text-align: center;
    margin-bottom: 16px;
  }
`;