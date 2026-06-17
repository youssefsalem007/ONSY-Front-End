# 🧠 ONSY - Advanced EEG Analysis

> **ONSY is a cutting-edge platform for advanced EEG Analysis, neurological insights, and cognitive tracking.**

[![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**🌐 Live Demo:** [https://onsy-for-your-mental-health.vercel.app/](https://onsy-for-your-mental-health.vercel.app/)

## 📖 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation & Getting Started](#installation--getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Project Overview
ONSY is a modern, responsive web application designed to provide advanced EEG (Electroencephalography) analysis. It integrates AI-driven interactions, real-time mood tracking, and comprehensive neurological data visualization into an intuitive user interface, helping users unlock deep insights into their cognitive and emotional well-being.

---

## ✨ Key Features
- **📊 Advanced EEG Analysis:** Dedicated modules for visualizing and analyzing complex neurological data.
- **🤖 AI Speak Chatbot:** An integrated AI assistant for real-time interaction and guidance.
- **🎭 Mood & Emotion Tracking:** Continuous mood tracking (MoodT) and emotional insights (EMotiv) with regular reminder notifications.
- **🔐 Robust Authentication:** Secure sign-up, sign-in, OTP verification, and password recovery.
- **🛡️ Protected Routing:** Advanced route protection including standard auth walls and payment-gated features.
- **🌍 Internationalization (i18n):** Multi-language support for a global user base.
- **⚡ Real-time Updates:** Powered by Socket.io for instantaneous data synchronization.
- **🎨 Modern UI/UX:** Built with HeroUI, Tailwind CSS, and smooth Framer Motion animations.

---

## 🛠️ Tech Stack

**Frontend Framework & Tooling**
- React 19
- Vite 7
- React Router DOM 7

**Styling & UI Components**
- Tailwind CSS 4
- HeroUI (System, React, Styles)
- Framer Motion (Animations)
- Lucide React & React Icons

**State Management & Forms**
- React Hook Form
- Zod (Schema Validation)
- Context API (Theme, Socket)

**Data Visualization & Integration**
- Recharts (Charts and graphs)
- Axios (HTTP Client)
- Socket.io Client (Real-time communication)

**Internationalization**
- i18next & react-i18next

---

## 📂 Folder Structure

```text
📦 oncyfront-end
 ┣ 📂 public/              # Static public assets
 ┣ 📂 src/
 ┃ ┣ 📂 assets/            # Images, icons, and local assets
 ┃ ┣ 📂 components/        # Reusable UI components (e.g., Notifications)
 ┃ ┣ 📂 context/           # React Context providers (Theme, Socket)
 ┃ ┣ 📂 layout/            # Layout wrappers (e.g., MainNav)
 ┃ ┣ 📂 locales/           # i18n translation files
 ┃ ┣ 📂 pages/             # Application pages (Home, Dashboard, EEGAnalysis, etc.)
 ┃ ┣ 📂 routes/            # Route configurations (PublicRoute, ProtectedRoute)
 ┃ ┣ 📂 schemas/           # Zod validation schemas
 ┃ ┣ 📂 services/          # API calling services/hooks
 ┃ ┣ 📂 utils/             # Helper and utility functions
 ┃ ┣ 📜 App.jsx            # Main Application Component & Routing
 ┃ ┣ 📜 i18n.js            # Internationalization setup
 ┃ ┣ 📜 index.css          # Global Tailwind styles
 ┃ ┗ 📜 main.jsx           # React DOM rendering entry point
 ┣ 📜 .env                 # Environment variables
 ┣ 📜 eslint.config.js     # Linter configuration
 ┣ 📜 index.html           # HTML entry point
 ┣ 📜 package.json         # Project metadata and dependencies
 ┗ 📜 vite.config.js       # Vite configuration
```

---

## 🚀 Installation & Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone [https://github.com/YE-19/ONSY-Front-End]
cd ONSY-Front-End
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Run the Development Server
```bash
npm run dev
# or
yarn dev
```
Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite) to view the application.

---

## 💡 Usage

Once the application is running:
1. **Sign Up/In:** Create an account to access protected features.
2. **Dashboard:** View your overall cognitive summary.
3. **EEG Analysis:** Navigate to the EEG section (Note: Requires valid payment/subscription access).
4. **Chatbot:** Use the Speak AI Chatbot for queries or guidance.
5. **Mood Tracking:** Log your emotional state and review your history over time.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please make sure to update tests as appropriate and adhere to the project's code styling guidelines (ESLint).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. *(Update this section if using a different license)*

## 👥 Team

**Supervised By:**
- Dr. Ghada El khayat

**Submitted By:**
- Mustafa Ibrahem Elsayed Ahmed
- Yassin El Gheryany
- Youssef Salem Abdelkhalek
- Ahmed Sameh Mohamed
- Youssef Ehab Aly Shahat
- Ayah Mohamed Ahmed Elmaghraby
- Shahd Elsayed Abdelrahman Ali
- Salma Ahmed Ibrahim Othman
- Maram Mahmoud Mosaed Haiba
- Salwa khaled Mohammed
- Dina Ibrahim Anis Mohammed Zayed

---

## 📫 Contact

- **Name:** [Insert Your Name]
- **GitHub:** [@YE-19](https://github.com/YE-19)
- **LinkedIn:** [Youssef Ehab](www.linkedin.com/in/youssef-ehab-ye19)
- **Email:** [ehab56526@gmail.com](ehab56526@gmail.com)

---
*Made with ❤️ by ONSY Team*
