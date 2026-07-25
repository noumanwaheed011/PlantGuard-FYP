# PlantGuard AI – React Frontend

Modern, responsive React frontend for PlantGuard AI (plant disease detection). Built with React, React Router, Tailwind CSS, and Framer Motion.

## Tech Stack

- **React** (functional components)
- **React Router** – client-side routing
- **Tailwind CSS** – styling, dark-green/agriculture theme
- **Framer Motion** – page and component animations
- **Lucide React** – icons

## Run the app

```bash
cd plantguard-react
npm install   # if not already done
npm run dev
```

Open **http://localhost:5173** in your browser.

## Build for production

```bash
npm run build
npm run preview   # preview production build
```

## Project structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── AnimatedButton.jsx
│   └── PageTransition.jsx
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Login.jsx
│   └── Signup.jsx
├── assets/
├── App.jsx
├── main.jsx
└── index.css
```

## Features

- **Pages:** Home (landing), About, Login, Signup
- **UI:** Dark-green theme, glassmorphism-style cards, gradients, responsive layout
- **Animations:** Page transitions, hero entrance, button hover/tap, card scroll reveal, navbar on scroll, input focus
- **Forms:** Controlled inputs, password show/hide, basic validation (required, email format)

**Pure frontend:** No backend or API is required. Authentication (login/signup/OTP) and data (analyses, profile, notifications) are handled with mock logic and localStorage. The app runs entirely in the browser.
