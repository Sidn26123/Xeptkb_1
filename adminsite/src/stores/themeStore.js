import { create } from 'zustand';

const useThemeStore = create((set) => ({
    theme:
        localStorage.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'),

    actions: {
        toggleTheme: () =>
            set((state) => {
                const newTheme = state.theme === 'dark' ? 'light' : 'dark';
                localStorage.theme = newTheme;
                document.documentElement.classList.toggle(
                    'dark',
                    newTheme === 'dark'
                );
                return { theme: newTheme };
            }),

        setTheme: (theme) =>
            set(() => {
                if (theme === 'system') {
                    localStorage.removeItem('theme');
                    const prefersDark = window.matchMedia(
                        '(prefers-color-scheme: dark)'
                    ).matches;
                    document.documentElement.classList.toggle(
                        'dark',
                        prefersDark
                    );
                    return { theme: prefersDark ? 'dark' : 'light' };
                }

                localStorage.theme = theme;
                document.documentElement.classList.toggle(
                    'dark',
                    theme === 'dark'
                );
                return { theme };
            }),
    },
}));

export default useThemeStore;

// --- Hooks tiện dụng ---
export const useTheme = () => useThemeStore((s) => s.theme);
export const useThemeActions = () => useThemeStore((s) => s.actions);
