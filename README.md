# Project Portfolio - Frontend

React frontend for the Project Portfolio team task manager app.

## Setup

1. Clone the repo
2. Run `npm install`
3. Create `.env` file (see `.env.example`) and set your backend URL
4. Run `npm start`

## Features

- Login / Signup with role selection (Admin or Member)
- Dashboard showing task stats (total, todo, in progress, done, overdue)
- Projects page — admin can create/delete projects and add members
- Project detail page — admin can create/edit/delete tasks and assign them
- Members can update status of their own assigned tasks
- Protected routes — must be logged in to access

## Tech Stack
- React 18
- React Router v6
- Axios
- Plain CSS (no UI libraries)

## Folder Structure

```
src/
  api/       - axios setup
  context/   - auth context (JWT stored in localStorage)
  pages/     - Login, Signup, Dashboard, Projects, ProjectDetail
  components/ - Navbar
```

## Deployment

Build with `npm run build` and deploy the build folder to Railway or Netlify.
Make sure to set `REACT_APP_API_URL` to your deployed backend URL.
