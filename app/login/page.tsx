"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* =========================================
   1. STORAGE SYSTEM (Must match Register page)
   ========================================= */

interface User {
  fullName: string;
  email: string;
  password?: string;
}

const STORAGE_KEY = "onboard_registered_users";
const SESSION_KEY = "onboard_current_user";

const authStorage = {
  getUsers: (): User[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Verify credentials against registered users
  login: (email: string, password?: string): User | null => {
    const users = authStorage.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (user) {
      // Save session for the dashboard
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  }
};

/* =========================================
   2. MAIN COMPONENT
   ========================================= */

export default function LoginPage() {
  const router = useRouter();
  
  // Prevent hydration errors in Next.js
  const [mounted, setMounted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null); // Clear error when user types
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const user = authStorage.login(formData.email, formData.password);

      if (user) {
        // Success! Redirect to dashboard (which you will build next)
        router.push("/dashboard");
      } else {
        setError("Invalid email or password.");
        setIsLoading(false);
      }
    }, 800);
  };

  if (!mounted) return null;

  return (
    <main className="ob-page">
      {/* Embedded CSS for exact design matching */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Decorative Background Circles */}
      <div className="ob-bg-wrapper">
        <div className="ob-circle-large"></div>
        <div className="ob-circle-small"></div>
      </div>

      {/* Main Content Container */}
      <div className="ob-content">
        
        {/* Header */}
        <div className="ob-header">
          <h1 className="ob-title">Welcome back</h1>
        </div>

        {/* Illustration */}
        <div className="ob-illustration-wrapper">
          {/* Using a high-quality SVG that mimics your image */}
          <img 
            src="https://cdni.iconscout.com/illustration/premium/thumb/mother-and-son-going-to-school-4830984-4030025.png?f=webp" 
            alt="Welcome illustration" 
            className="ob-illustration"
          />
        </div>

        {/* Notifications */}
        {error && <div className="ob-alert ob-alert-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="ob-form" noValidate>
          
          <div className="ob-input-group">
            <input
              type="email"
              name="email"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={handleChange}
              className="ob-input"
              disabled={isLoading}
            />
          </div>

          <div className="ob-input-group">
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              className="ob-input"
              disabled={isLoading}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="ob-forgot-wrapper">
            <a href="#" className="ob-forgot-link">Forget password?</a>
          </div>

          <button 
            type="submit" 
            className={`ob-button ${isLoading ? "ob-button-disabled" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="ob-footer">
          Don't have an account? <Link href="/" className="ob-link">Sign Up</Link>
        </p>

      </div>
    </main>
  );
}

/* =========================================
   3. CSS STYLES
   ========================================= */

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

  .ob-page {
    font-family: 'Poppins', system-ui, -apple-system, sans-serif;
    background-color: #F3F6F5;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
    padding-top: 120px;
    padding-bottom: 40px;
    box-sizing: border-box;
  }

  .ob-page *, .ob-page *::before, .ob-page *::after {
    box-sizing: inherit;
  }

  /* Background Circles */
  .ob-bg-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 400px;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }

  .ob-circle-large {
    position: absolute;
    top: -100px;
    left: -80px;
    width: 320px;
    height: 320px;
    background-color: #8EE3D9;
    border-radius: 50%;
    opacity: 0.7;
    mix-blend-mode: multiply;
  }

  .ob-circle-small {
    position: absolute;
    top: 30px;
    left: 60px;
    width: 220px;
    height: 220px;
    background-color: #7DD3C9;
    border-radius: 50%;
    opacity: 0.8;
    mix-blend-mode: multiply;
  }

  /* Content Container */
  .ob-content {
    width: 100%;
    max-width: 420px;
    padding: 0 24px;
    z-index: 10;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .ob-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .ob-title {
    font-size: 26px;
    font-weight: 800;
    color: #0F172A;
    margin: 0;
    letter-spacing: -0.5px;
  }

  /* Illustration */
  .ob-illustration-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 48px;
  }

  .ob-illustration {
    width: 240px;
    height: auto;
    object-fit: contain;
  }

  /* Alerts */
  .ob-alert {
    padding: 12px 16px;
    border-radius: 14px;
    font-size: 14px;
    text-align: center;
    margin-bottom: 20px;
    font-weight: 500;
  }

  .ob-alert-error {
    background-color: #FEF2F2;
    color: #B91C1C;
    border: 1px solid #FECACA;
  }

  /* Form */
  .ob-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ob-input-group {
    width: 100%;
  }

  .ob-input {
    width: 100%;
    padding: 18px 24px;
    background-color: #FFFFFF;
    border: none;
    border-radius: 24px;
    font-size: 15px;
    font-family: inherit;
    color: #0F172A;
    outline: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
    transition: box-shadow 0.2s ease;
  }

  .ob-input::placeholder {
    color: #64748B;
    font-weight: 400;
  }

  .ob-input:focus {
    box-shadow: 0 0 0 2px #53C8C1;
  }

  .ob-input:disabled {
    background-color: #F8FAFC;
    cursor: not-allowed;
    opacity: 0.8;
  }

  /* Forgot Password */
  .ob-forgot-wrapper {
    text-align: center;
    margin-top: 4px;
    margin-bottom: 8px;
  }

  .ob-forgot-link {
    font-size: 14px;
    color: #53C8C1;
    text-decoration: none;
    font-weight: 500;
  }

  .ob-forgot-link:hover {
    text-decoration: underline;
  }

  /* Button */
  .ob-button {
    width: 100%;
    padding: 18px;
    background-color: #53C8C1;
    color: #FFFFFF;
    border: none;
    border-radius: 12px;
    font-size: 17px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }

  .ob-button:hover:not(:disabled) {
    background-color: #46B0AA;
  }

  .ob-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .ob-button-disabled {
    background-color: #9EDBD8;
    cursor: not-allowed;
  }

  /* Footer */
  .ob-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 15px;
    color: #0F172A;
  }

  .ob-link {
    color: #53C8C1;
    text-decoration: none;
    font-weight: 500;
  }

  .ob-link:hover {
    text-decoration: underline;
  }
`;