"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================
   1. STORAGE SYSTEM (LocalStorage)
   ========================================= */

interface User {
  fullName: string;
  email: string;
  password?: string;
}

const STORAGE_KEY = "onboard_registered_users";

const authStorage = {
  register: (user: User): { success: boolean; message: string } => {
    if (typeof window === "undefined") return { success: false, message: "Browser error" };
    
    const users = authStorage.getUsers();
    
    if (users.some((u) => u.email === user.email.toLowerCase())) {
      return { success: false, message: "Email is already registered." };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify([...users, user]));
    return { success: true, message: "Registration successful!" };
  },

  getUsers: (): User[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
};

/* =========================================
   2. MAIN COMPONENT
   ========================================= */

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = authStorage.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        setSuccess(true);

        // Save session so the dashboard recognizes the user is logged in
        localStorage.setItem(
          "current_user",
          JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
          })
        );

        // Redirect directly to your dashboard
        router.push("/dashboard");
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <main className="ob-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="ob-bg-wrapper">
        <div className="ob-circle-large"></div>
        <div className="ob-circle-small"></div>
      </div>

      <div className="ob-content">
        <div className="ob-header">
          <h1 className="ob-title">Welcome to Onboard!</h1>
          <p className="ob-subtitle">Let's help to meet up your tasks.</p>
        </div>

        {error && <div className="ob-alert ob-alert-error">{error}</div>}
        {success && (
          <div className="ob-alert ob-alert-success">
            Account created successfully! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="ob-form" noValidate>
          <div className="ob-input-group">
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              className="ob-input"
              disabled={isLoading || success}
            />
          </div>

          <div className="ob-input-group">
            <input
              type="email"
              name="email"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={handleChange}
              className="ob-input"
              disabled={isLoading || success}
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
              disabled={isLoading || success}
            />
          </div>

          <div className="ob-input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="ob-input"
              disabled={isLoading || success}
            />
          </div>

          <button
            type="submit"
            className={`ob-button ${isLoading || success ? "ob-button-disabled" : ""}`}
            disabled={isLoading || success}
          >
            {isLoading ? "Registering..." : success ? "Success!" : "Register"}
          </button>
        </form>

        <p className="ob-footer">
          Already have an account? <a href="/login" className="ob-link">Sign In</a>
        </p>
      </div>
    </main>
  );
}

/* =========================================
   3. CSS STYLES
   ========================================= */

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

  .ob-page {
    font-family: 'Poppins', system-ui, -apple-system, sans-serif;
    background-color: #F3F6F5;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
    padding-top: 140px;
    padding-bottom: 40px;
    box-sizing: border-box;
  }

  .ob-page *, .ob-page *::before, .ob-page *::after {
    box-sizing: inherit;
  }

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

  .ob-content {
    width: 100%;
    max-width: 420px;
    padding: 0 24px;
    z-index: 10;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .ob-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .ob-title {
    font-size: 26px;
    font-weight: 800;
    color: #0F172A;
    margin: 0 0 12px 0;
    letter-spacing: -0.5px;
  }

  .ob-subtitle {
    font-size: 15px;
    color: #334155;
    margin: 0 auto;
    max-width: 220px;
    line-height: 1.4;
  }

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

  .ob-alert-success {
    background-color: #ECFDF5;
    color: #047857;
    border: 1px solid #A7F3D0;
  }

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

  .ob-button {
    width: 100%;
    padding: 18px;
    margin-top: 12px;
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