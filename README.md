# Manager Facturi

A modern, full-featured invoice management web application for businesses and clients. Built with React and Firebase, it supports multi-role authentication, invoice creation, PDF export, reporting, and more.

## ✨ Features
- **Admin & Client Portals**: Separate dashboards and login/register flows for admins and clients
- **Role Management**: Assign and manage user roles (admin/client)
- **Invoice Creation & Management**: Create, edit, and track invoices with customizable line items, taxes, and discounts
- **PDF Generation**: Export invoices as professional PDFs
- **Client Management**: Add, update, and organize client information
- **Reports**: View revenue, outstanding payments, and other analytics
- **Settings**: Customize company info, default currency, tax rate, and more
- **Theme & Language Switcher**: Light/dark mode and multi-language support (EN/RO/DE)
- **Secure Authentication**: Firebase Auth for secure login and registration

---

## 🚀 Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd manager-facturi
```

### 2. Install dependencies
> **Note:** If you see dependency conflicts, use the legacy flag as below.
```sh
npm install --legacy-peer-deps
```

### 3. Configure Firebase
Edit `src/firebase.js` with your Firebase project credentials. The default config is for demo/testing only.

### 4. Start the development server
```sh
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧑‍💼 Usage

### Admin Portal
- Register at `/register` (first user becomes admin)
- Access dashboard, manage clients, create invoices, view reports, assign roles
- Admin-only routes are protected

### Client Portal
- Register at `/client/register`
- Login at `/client/login`
- View/download invoices, update profile, make payments (if enabled)

### Role Management
- Use the **Role Manager** (`/admin/roles`) to assign roles to users
- Run the migration script in `src/utils/migrateUsers.js` to assign default roles to existing users

---

## 🛠️ Available Scripts
- `npm start` – Run the app in development mode
- `npm run build` – Build for production
- `npm test` – Run tests

---

## 📁 Folder Structure
- `src/components/` – React components (Admin, Client, Auth, Dashboard, etc.)
- `src/context/` – Auth and Theme context providers
- `src/utils/` – Utility functions (currency, user migration)
- `src/firebase.js` – Firebase config and initialization
- `public/` – Static assets and HTML

---

## 🌐 Customization
- **Theme:** Switch between light/dark/system in Settings or via ThemeSwitcher
- **Language:** EN, RO, DE supported (Settings/Profile)
- **Currency:** Set default currency in Settings

---

## 🐞 Troubleshooting
- If `react-scripts` is missing, run `npm install --legacy-peer-deps`
- For Firebase errors, check your credentials in `src/firebase.js`
- For role issues, use the Role Manager or migration script
- For more help, check browser console logs or `/debug` route

---

## 📄 License
MIT (or specify your license here)

---

## 🙏 Credits
Developed by Murarasu Andrei as a Licenta project. Special thanks to open-source contributors and the React/Firebase communities.
