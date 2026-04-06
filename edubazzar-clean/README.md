# EduBazzar Frontend

React + CSS frontend for the EduBazzar backend.

## Setup

**Step 1 — Make sure you are in the right folder.**

The folder you run commands from must contain `index.html`, `package.json`, `vite.config.js`, and a `src/` folder.

```
edubazzar-frontend/        ← run commands from HERE
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── components/
    │   └── ResourceDetailModal.jsx
    └── pages/
        ├── AuthPage.jsx
        ├── BuyerDashboard.jsx
        ├── RoleSelect.jsx
        └── SellerDashboard.jsx
```

**Step 2 — Install dependencies**

```bash
cd edubazzar-frontend
npm install
```

**Step 3 — Start your backend first**

```bash
# In the server/ folder:
cd server
npm install
npm start    # or: node server.js
```

**Step 4 — Start the frontend**

```bash
# Back in edubazzar-frontend/
npm run dev
```

Opens at **http://localhost:3000**

---

## Common Errors

### `Failed to load url /src/main.jsx`
You are running `npm run dev` from the **wrong folder**. Make sure you `cd` into the folder that contains `index.html` before running the command.

### `Cannot connect to server`
Your backend is not running. Start it first (see Step 3).

---

## API Base URL

The frontend calls `http://localhost:5000/api`. If your backend runs on a different port, edit `vite.config.js` and change the proxy target, then also update `src/pages/AuthPage.jsx` line 3:

```js
const API = "http://localhost:YOUR_PORT/api";
```
