// ThemeToggle.js
import { useThemeStore } from "./themeStore";

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <button className={darkMode ? "btn-dark" : "btn-light"}
      onClick={toggleDarkMode}>
      {darkMode ? "🌙 다크 모드" : "☀️ 라이트 모드"}
    </button>
  );
}

export default ThemeToggle;
