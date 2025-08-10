// import { useEffect, useState } from "react";
// import { BiMoon, BiSun } from "react-icons/bi";

// export default function ToggleTheme() {
//   const [isDark, setIsDark] = useState(() => {
//     // Check localStorage or system preference on initial load
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//       return savedTheme === 'dark';
//     }
//     return window.matchMedia('(prefers-color-scheme: dark)').matches;
//   });

//   useEffect(() => {
//     // Apply theme to document
//     if (isDark) {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   }, [isDark]);

//   const toggleDarkMode = () => {
//     setIsDark(!isDark);
//   };

//   return (
//     <button
//       onClick={toggleDarkMode}
//       className="text-xl cursor-pointer"
//     >
//       {isDark ? <BiSun /> : <BiMoon />}
//     </button>
//   );
// }