# ExpenseLens 🔍

> **Know exactly where every rupee goes — 100% privately.**

Welcome to **ExpenseLens**! If you are tired of cluttered spreadsheets and tracking your money in complex apps that sell your data, you are in the right place. 

ExpenseLens is a premium, privacy-first financial command center. Just drop your bank statement CSV file (we support **HDFC, ICICI, SBI, and Axis**), and watch your financial data turn into beautiful, interactive, and private insights in seconds.

---

## ✨ Features You'll Love

* **🎨 Sleek Bento Dashboard:** A gorgeous, clean dark-light interface with interactive glassmorphic cards and category insights.
* **📈 Apple Health-Style Spline Graph:** A custom-built vector SVG graph that charts your daily spend velocity dynamically.
* **📥 Staged Ingestion & Progress Bars:** Drag and drop your statement, review the file details, cancel it if you selected the wrong one, and watch it upload with animated loaders and toaster success alerts.
* **🎬 Monthly Wrapped Slideshow:** A Spotify-Wrapped style stories recap that plays your monthly spends, top category spotlight, and AI heuristics.
* **⚙️ Sliding Profile Settings:** Customize your display name, choose color-coded profile avatars, and toggle specific audit notification rules in an instant.
* **🔒 Isolated & Deduplicated Database:** Built-in safeguards check transactions for duplicates so you can upload the same statement multiple times without messing up your math. All data is processed locally.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion, React Query (TanStack)
* **Backend:** Spring Boot (Java), Spring Security (JWT HTTP-Only Cookies)
* **Database:** PostgreSQL (sandboxed local container)

---

## 🚀 Quick Start & Setup

Running ExpenseLens locally is easy. Follow these steps:

### 1. Fire Up the Database
Make sure you have Docker running, then start the PostgreSQL container:
```bash
docker-compose up -d
```

### 2. Launch the Backend Server
Navigate to the `backend` folder and run the Spring Boot application:
```bash
cd backend
# Build and run using the Maven wrapper
./mvnw spring-boot:run
```
*The API will be available at `http://localhost:8080`.*

### 3. Launch the Frontend UI
Open a new terminal tab, navigate to the `frontend` folder, install the packages, and run the developer server:
```bash
cd frontend
npm install
npm run dev
```
*Open your browser and navigate to `http://localhost:3000` to see the app!*

---

## 📂 Testing with Mock Statements

We have created some ready-to-use mock statement files so you don't have to upload your real bank data to test it. You can find them in your workspace folder:
* **HDFC Statement:** `/samples/hdfc_statement.csv`
* **SBI Statement:** `/samples/sbi_statement.csv`
* **ICICI Statement:** `/samples/icici_statement.csv`
* **Axis Statement:** `/samples/axis_statement.csv`
* **Massive 20-row Statement:** `/samples/massive_statement.csv` *(Best for seeing the curved Weekly Flow graph in action!)*

---

## 🔒 Privacy Guarantee
Your files never leave your computer. Parsing and normalization are processed entirely in memory on your local Spring Boot sandbox, and data is saved to your local PostgreSQL container.

---
*Made with ❤️ for premium financial clarity.*
