# ✦ HerWorth — Personal Finance Platform

A polished, production-ready personal finance web app designed with a feminine, luxury fintech aesthetic. Built with vanilla HTML, CSS and JavaScript — no frameworks required, deployable on GitHub Pages in minutes.

---

## 📄 Pages

| Page | File | Description |
|------|------|-------------|
| Login / Sign Up | `index.html` | Auth page with form validation & Google mock OAuth |
| Dashboard | `dashboard.html` | Overview, charts, recent transactions, budget alerts |
| Expenses | `expenses.html` | Add / edit / delete transactions, filter & sort |
| Budget & Goals | `budget.html` | Category spending limits + savings goals with progress |
| Accounts | `accounts.html` | Multi-account overview with total balance |
| Profile | `profile.html` | Update name/email/password, preferences, danger zone |

---

## ✨ Features

- **Auth** — Sign up, login, form validation, password strength meter, mock Google OAuth
- **Dashboard** — Live stats cards, line chart (week/month/year), doughnut pie chart by category, recent transactions, budget alerts
- **Expenses** — Add/edit/delete, category icons, filter by category/date, sort by date/amount
- **Budgets** — Per-category monthly limits with progress bars, over-budget alerts
- **Savings Goals** — Named goals with emoji, target + saved amounts, progress tracking
- **Accounts** — Multiple accounts with color coding, total balance roll-up
- **Profile** — Edit personal info, change password, currency preference
- **Dark Mode** — Full pink-accented dark mode toggle (persisted)
- **Demo Data** — New signups get realistic seeded data automatically
- **Data Persistence** — All data stored in localStorage (no backend needed for GitHub Pages)

---

## 🚀 Deploy to GitHub Pages

1. Upload all files to a GitHub repository
2. Go to **Settings → Pages**
3. Set Source → **Deploy from a branch → `main` → `/ (root)`**
4. Your site will be live at: `https://yourusername.github.io/herworth/`

### Running locally:
```bash
python3 -m http.server 8000
# or
npx serve .
```
Then open `http://localhost:8000`

---

## 🔐 Demo Login

Sign up with any email + password (8+ chars) to create an account with sample data.

Or use the **"Continue with Google"** button to instantly access a demo account.

---

## 🗂 File Structure

```
herworth/
├── index.html       # Login / Sign Up
├── dashboard.html   # Main dashboard
├── expenses.html    # Expense tracker
├── budget.html      # Budgets & savings goals
├── accounts.html    # Account balances
├── profile.html     # User profile & settings
├── style.css        # Complete stylesheet
├── app.js           # Core: auth, storage, shared utils
├── dashboard.js     # Dashboard charts & data
├── expenses.js      # Expense CRUD
├── budget.js        # Budget & goal CRUD
├── accounts.js      # Account CRUD
├── profile.js       # Profile settings
└── README.md
```

---

## 🎨 Design System

- **Primary font:** Cormorant Garamond (display) + DM Sans (body)
- **Pink palette:** `#f8c8dc` (light), `#e8a0bd` (mid), `#c4637a` (rose), `#a84d64` (dark)
- **Charts:** Chart.js (CDN, no install needed)
- **Theme:** Soft luxury fintech — rounded cards, gradient accents, smooth animations

---

## 📞 Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Vanilla HTML/CSS/JS | Zero build step, instant GitHub Pages deploy |
| Styling | Custom CSS with variables | Full design control, no Tailwind purge needed |
| Charts | Chart.js (CDN) | Lightweight, beautiful, zero config |
| Storage | localStorage | No backend needed for MVP |
| Fonts | Google Fonts | Cormorant Garamond + DM Sans |

---

## 🔮 Future Backend Integration

When you're ready to add a real backend, replace the localStorage functions in `app.js` with API calls:

- **Auth:** Firebase Auth or Supabase
- **Database:** Firestore or PostgreSQL (via Supabase)
- **API:** Node.js + Express or Next.js API routes
- **Hosting:** Vercel, Railway, or Render

The frontend is structured so that swapping `getExpenses()`, `saveExpenses()` etc. to fetch calls requires minimal changes.
