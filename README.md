# SnapReserve: Photography Studio Booking & Package Management System

## 📌 Project Overview
SnapReserve is a comprehensive, full-stack online booking and schedule management platform tailored for photography studios. It empowers customers to seamlessly reserve creative sessions while providing studio administrators with a robust dashboard to manage photographer availability, service packages, and operational revenue.

## 🚀 Key Features

**For Customers:**
* **Dynamic Search:** Browse available photographers and packages by specific dates and event types.
* **Seamless Reservations:** Book photography sessions with detailed event classifications and special production requests.
* **Real-Time Tracking:** A dedicated confirmation portal to check reservation status securely.
* **Portfolio Showcase:** Explore the studio's past work via an interactive, categorizable photo gallery.

**For Administrators & Photographers:**
* **Package Management:** Create, edit, and publish studio photography packages with pricing and service details.
* **Intelligent Scheduling:** View a streamlined, chronological timeline of photographer assignments and workloads.
* **Conflict Prevention:** Automated backend validation prevents overlapping bookings for the same photographer on a given date.
* **Workflow Operations:** Update and track booking lifecycle statuses (Pending, Confirmed, Ongoing, Completed, Cancelled).
* **Analytics Dashboard:** Monitor critical business metrics, including total package revenue, upcoming shoot volume, and photographer utilization rates.
* **Notification Center:** Receive real-time alerts for pending approvals and new bookings.

## 💻 Tech Stack
* **Frontend:** ReactJS (React Router, Recharts for Data Visualization, Axios)
* **Backend:** Node.js, Express.js
* **Database:** SQLite (Relational Data Modeling)

## 🛠️ Setup & Installation Instructions

Follow these steps to run the application locally.

### 1. Database Initialization
The SQLite database (`studio.db`) is automatically initialized upon starting the backend server. No manual database creation is required. The system includes an auto-patching mechanism to ensure schema updates (like adding the `special_requests` column) are applied seamlessly.

### 2. Backend Setup
1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend

```

2. Install the required dependencies:
```bash
npm install express sqlite sqlite3

```


3. Start the Express server:
```bash
node app.js

```


*The server will run on `http://localhost:4000`.*

### 3. Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend

```


2. Install the React dependencies:
```bash
npm install axios react-router-dom recharts

```


3. Start the React development server:
```bash
npm start

```


*The application will launch in your default browser.*

## 🌍 Environment Variables

For local development, the React frontend is configured to communicate with the local Node.js server. If deploying to production, ensure you set up the appropriate environment variables:

* **Backend:** Define `PORT` (defaults to 4000).
* **Frontend:** If using a `.env` file, map your API base URL (e.g., `REACT_APP_API_URL=https://your-backend-domain.com`).

## 🔐 Authentication & Demo Access

For demonstration purposes, the Administrative Management portal (`/manage`) is protected via a simulated `ProtectedRoute` component.

* **Role:** Admin access is simulated as explicitly `true` in this build. Simply click on the "Management" or "Analytics" tabs in the navigation bar to access the protected features.

## 📡 API Endpoint Summary

| Method   |     Endpoint    |        Purpose |
| **POST** | `/api/packages` | Create a new photography package. |
| **GET** | `/api/packages` | Retrieve all active studio packages. |
| **GET** | `/api/photographers` | Retrieve all registered studio photographers. |
| **GET** | `/api/photographers/availability` | Check photographer availability by date. |
| **POST** | `/api/bookings` | Create a new client reservation. |
| **GET** | `/api/bookings` | List bookings (supports filtering & pagination). |
| **PUT** | `/api/bookings/:id/status` | Update lifecycle status of a specific booking. |
| **GET** | `/api/dashboard/studio` | Return core studio operational metrics. |
| **GET** | `/api/gallery` | Retrieve portfolio images for the gallery preview. |
| **GET** | `/api/analytics/revenue` | Fetch aggregated financial data for dashboard charts. |
| **GET** | `/api/bookings/reminders` | Fetch system alerts for pending booking approvals. |

## 📸 Screenshots

* `[Insert Image of Dashboard Here]`
* `[Insert Image of Booking Form Here]`
* `[Insert Image of Management Timeline Here]`

## 🔗 Submission Links

* **Live Deployed Application:** [Insert Deployed URL Here]
* **GitHub Repository:** [Insert Repo URL Here]
* **Video Walkthrough (5-8 mins):** [Insert Video URL Here]