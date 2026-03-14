/** @type {import('tailwindcss').Config} */
export default {
    // 1. THIS LINE IS MANDATORY
    darkMode: 'class',

    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Your custom colors here
        },
    },
    plugins: [],
}