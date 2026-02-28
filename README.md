# 🚀 AWMService Frontend

> **AWMService** (Academic Workflow Management Service) is a next-generation platform designed to streamline and automate the entire academic process—from theme selection to the final thesis defense. Built with a focus on efficiency, transparency, and a premium user experience.

---

## ✨ Features

### 🎓 For Students
- **Theme Selection**: Effortlessly browse and apply for research topics and directions.
- **Progress Tracking**: Real-time dashboard to monitor your journey from proposal to defense.
- **Workflow Steps**: Managed stages for Pre-defense, Normocontrol, Antiplagiarism checks, and Software verification.
- **Critique & Reviews**: View feedback from supervisors and examiners in one place.

### 🧑‍🏫 For Supervisors
- **Topic Management**: Create and manage available research topics and students.
- **Student Monitoring**: Dedicated dashboard to track the progress of supervisees.
- **Schedule Management**: Unified view of defense schedules and commission activities.
- **Review & Grading**: Tools for providing feedback and initial assessment scores.

### 🏢 For Department Admins
- **Global Settings**: Configure department-wide parameters and time periods.
- **Direction Management**: Define academic directions and research themes.
- **Supervisor Directory**: Manage and assign supervisors across the department.
- **Planning & Setup**: Comprehensive tools for setting up academic cycles and defense periods.

---

## 🛠️ Tech Stack

A modern, high-performance stack for a seamless user experience.

| Tech | Description |
| :--- | :--- |
| **React 19** | Modern UI library with Concurrent Mode and Server Components support. |
| **Vite** | Lightning-fast build tool and development server. |
| **React Router 7** | Robust routing engine for dynamic single-page application. |
| **Lucide Icons** | Beautiful, lightweight icons for a consistent visual language. |
| **Pangea DND** | Powerful drag-and-drop capabilities for interactive scheduling. |
| **Vanilla CSS** | Highly customized, premium styling with glassmorphism and animations. |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/awmservice-frontend.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd awmservice-frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Launch the development server**
   ```bash
   npm run dev
   ```

---

## 🏗️ Project Structure

```bash
src/
├── assets/          # Icons, images, and static resources
├── components/      # Reusable UI components (Headers, Sidebars, etc.)
├── pages/           # Page-level components for different roles
│   ├── Department/  # Admin and department management pages
│   ├── Supervisor/  # Supervisor dashboard and management
│   ├── Students/    # Student-facing workflows and profiles
│   └── LoginPage/   # Dedicated login and authentication
├── App.jsx          # Main application routing and layout logic
└── main.jsx         # Application entry point
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for the academic community
</p>
