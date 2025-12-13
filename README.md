📚 ESPRIM Virtual Library

A secure web platform for managing Final Year Project (PFE) reports at ESPRIM - École Supérieure Privée d'Ingénieurs de Monastir.

📖 Overview
ESPRIM Virtual Library is a comprehensive web application designed to streamline the management of Final Year Project reports at ESPRIM. The platform enables students to submit their PFE reports digitally, allows teachers to validate submissions, and provides secure document consultation with anti-plagiarism measures.

🎯 Key Features

🔐 Secure Authentication - JWT-based authentication with role management
📝 Student Dashboard - Submit reports, manage drafts, track validation status
✅ Teacher Dashboard - Review and validate/reject reports, add comments
👁️ Secure PDF Viewer - Read-only PDF viewing with watermarking
🔒 Anti-Plagiarism - Download blocking, copy-paste prevention, dynamic watermarks
📧 Email Notifications - Automatic alerts for status changes
📊 Metadata Management - Rich report metadata (keywords, authors, specialty, etc.)

🏗️ Architecture
Technology Stack:

Frontend

React.js 18.2
React Router v6
Tailwind CSS
Axios
PDF.js (for secure viewing)
Lucide React (icons)

Backend

Node.js 18 LTS
Express.js 4.18
Sequelize ORM
PostgreSQL 14
JWT Authentication
Multer (file uploads)
Nodemailer (emails)

📋 Prerequisites
Before running this project, ensure you have the following installed:

Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 14.0
Git

🚀 Installation & Setup

1. Clone the repository
   
git clone https://github.com/Hanen-BENMANAA/espBib.git

2. Setup Backend
   
   # Navigate to backend directory
   cd backend
   
   # Install dependencies
   npm install

   # Start development server
   node server.js
   
3. Setup Frontend
   
   # Install dependencies
   npm install

   # Start development server
   npm start



   


