# Resolve360 Complaint Management System

A streamlined Express.js + MySQL complaint management portal for campuses and organizations. Resolve360 keeps users and administrators aligned with real-time complaint tracking, approval workflows, and status notifications.

---

## Key Features
- **Unified Dashboard:** Users see complaint history, statuses, and replies at a glance. 
- **Role-Based Access:** Admins approve registrations, manage complaints, and respond with updates. 
- **Complaint Lifecycle Management:** Submit, track, acknowledge, and close complaints with auditable history. 
- **Automated Notifications:** Inline alerts highlight successful submissions, approvals, and follow-ups. 

---

## Tech Stack
- **Frontend:** EJS templates, HTML, CSS, Vanilla JS
- **Backend:** Node.js, Express.js
- **Database:** MySQL (compatible with XAMPP)
- **Session & Auth:** express-session with MySQL persistence

---

## Default Credentials
- **Admin:** `admin` / `admin123`
- **Demo User:** `user@example.com` / `user123`

These accounts are created when you run the `cms.sql` seed script.

---

## Setup Guide (Windows)

### Before You Start
- Install **Node.js 18 or newer** from [nodejs.org](https://nodejs.org/en/download/prebuilt-installer). The installer adds Node and npm to PATH automatically.
- Install **MySQL** (XAMPP’s MySQL module works perfectly). Make sure you know the root password—this project defaults to a blank password in `db.js`.
- **Download or clone** the repository into a convenient folder, e.g. `C:\Users\YourName\Resolve360`.

---

### Step 1. Open PowerShell in the Project Folder
- Press **Start**, type **PowerShell**, and open it.
- Run the command below, adjusting the path to where you extracted the project:
  ```powershell
  Set-Location "C:\Users\YourName\Resolve360"
  ```

### Step 2. Install Node Packages
- Fetch all dependencies listed in `package.json`:
  ```powershell
  npm install
  ```

### Step 3. Start MySQL
- Launch the **MySQL** service via the XAMPP Control Panel (or your preferred MySQL server).
- If your root account uses a password, open `db.js` and update the credentials before continuing.

### Step 4. Create the Database & Seed Data
- Apply the schema and default records (drops any existing tables with the same name):
  ```powershell
  "C:\xampp\mysql\bin\mysql.exe" -u root < cms.sql
  ```
- Add `-p` after `root` if your MySQL root user has a password.

### Step 5. Run the Server
- Start the Express app:
  ```powershell
  npm start
  ```
- Keep this PowerShell window open. Visit `http://localhost:3000` in your browser.

### Step 6. Log In
- Admin portal: `http://localhost:3000/admin` → use the default admin credentials.
- User portal: `http://localhost:3000/login` → use the demo user or create a new account (pending admin approval).

### Step 7. Shut Down When Finished
- Stop the Node server with **Ctrl + C** in PowerShell.
- Stop the MySQL service from XAMPP if you no longer need it.

---

## Screenshots

### Landing Page
![Landing Page](screenshots/landing-page.png)

### User Module
- **User Login**  
  ![User Login](screenshots/user-login.png)

- **User Register**  
  ![User Register](screenshots/user-register.png)

- **Submit Complaint**  
  ![Submit Complaint](screenshots/user-submit-complaint.png)

- **Complaints List**  
  ![User Complaints](screenshots/user-complaints.png)

### Admin Module
- **Admin Login**  
  ![Admin Login](screenshots/admin-login.png)

- **Admin Dashboard**  
  ![Admin Dashboard](screenshots/admin-dashboard.png)

- **Manage Users**  
  ![Manage Users](screenshots/admin-manage-users.png)

---
