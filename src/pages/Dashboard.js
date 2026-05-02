import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, projRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects')
        ])
        setTasks(taskRes.data)
        setProjects(projRes.data)
      } catch (err) {
        console.log('dashboard fetch error', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const todo = tasks.filter(t => t.status === 'todo').length
  const inProgress = tasks.filter(t => t.status === 'in-progress').length
  const done = tasks.filter(t => t.status === 'done').length

  // overdue = dueDate passed and not done
  const today = new Date()
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'done').length

  const statusBadge = (status) => {
    if (status === 'todo') return <span className="badge badge-todo">todo</span>
    if (status === 'in-progress') return <span className="badge badge-inprogress">in progress</span>
    return <span className="badge badge-done">done</span>
  }

  if (loading) return <div className="container" style={{ marginTop: 30 }}>Loading...</div>

  return (
    <div className="container">
      <div className="page-header">
        <h2>Dashboard</h2>
        <span style={{ fontSize: '14px', color: '#555' }}>Welcome back, {user?.name}</span>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <h4>Total Tasks</h4>
          <p>{tasks.length}</p>
        </div>
        <div className="stat-box">
          <h4>To Do</h4>
          <p>{todo}</p>
        </div>
        <div className="stat-box">
          <h4>In Progress</h4>
          <p>{inProgress}</p>
        </div>
        <div className="stat-box">
          <h4>Done</h4>
          <p>{done}</p>
        </div>
        <div className="stat-box">
          <h4>Overdue</h4>
          <p style={{ color: overdue > 0 ? 'red' : '#1a73e8' }}>{overdue}</p>
        </div>
        <div className="stat-box">
          <h4>Projects</h4>
          <p>{projects.length}</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '12px' }}>My Tasks</h3>
      {tasks.length === 0 && <p style={{ color: '#888', fontSize: '14px' }}>No tasks assigned yet.</p>}
      {tasks.map(task => (
        <div className="task-item" key={task._id}>
          <div>
            <div className="task-title">
              {task.title}
              {statusBadge(task.status)}
            </div>
            <div className="task-meta">
              Project: {task.project?.name || '—'} &nbsp;|&nbsp;
              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'no due date'}
              {task.dueDate && new Date(task.dueDate) < today && task.status !== 'done' &&
                <span style={{ color: 'red', marginLeft: 6 }}>overdue</span>
              }
            </div>
          </div>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        </div>
      ))}
    </div>
  )
}

export default Dashboard
