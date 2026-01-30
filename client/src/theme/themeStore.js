// // themeStore.js
// import { create } from "zustand";

// export const useThemeStore = create((set) => ({
//   darkMode: false,
//   toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
// }));

// Recoil에서 key는 Atom이나 Selector를 고유하게 
// 식별하는 필수 문자열 값으로, 전역적으로 
// 중복되지 않아야 합니다. 디버깅, 지속성(persistence), 
// 그리고 상태 간 의존성을 추적하는 데 사용되며, 
// 애플리케이션 전체에서 유일한 식별자 역할


// themeStore.js (localStorage 유지)
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: "theme-storage", // localStorage key
    }
  )
);
