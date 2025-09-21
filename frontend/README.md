# Frontend - Assignment Portal (Tailwind)

## Setup (quick)
1. Create app: `npx create-react-app frontend` (if not already)
2. Copy this repo's `src` and `public` into the CRA project.
3. Install deps:
   ```bash
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
4. Ensure `tailwind.config.js` content paths include `./src/**/*.{js,jsx,ts,tsx}` and `./public/index.html`.
5. Start the app: `npm start`

Notes:
- The UI uses Tailwind classes in components.
- API base URL defaults to http://localhost:5000 (can set REACT_APP_API).
