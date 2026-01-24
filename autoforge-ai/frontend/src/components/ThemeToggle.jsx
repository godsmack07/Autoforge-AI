import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import './ThemeToggle.css';
import { toast } from 'react-hot-toast';
const ThemeToggle = ({ darkMode, setDarkMode }) => {
  return (
    <div className="theme-toggle">
      <input
        type="checkbox"
        id="theme-switch"
        className="theme-switch"
        checked={darkMode}
        onChange={() => setDarkMode(!darkMode)}
      />
      <label htmlFor="theme-switch" className="theme-label">
        <FaSun className="sun-icon" />
        <FaMoon className="moon-icon" />
        <span className="theme-slider"></span>
      </label>
    </div>
  );
};

export default ThemeToggle;