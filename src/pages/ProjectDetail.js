import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', status: 'todo' })
  const [err, setErr] = useState('')

  const fetchAll = async () => {
    const [projRes, taskRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?project=${id}`)
    ])
    setProject(projRes.data)
    setTasks(taskRes.data)
  }

  useEffect(() => {
    fetchAll()
    if (user?.role === 'admin') {
      api.get('/users').then(res => setUsers(res.data))
    }
  }, [id])

  const openCreate = () => {
    setEditTask(null)
    setForm({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', status: 'todo' })
    setShowModal(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask._id}`, form)
      } else {
        await api.post('/tasks', { ...form, project: id })
      }
      setShowModal(false)
      fetchAll()
    } catch (error) {
      setErr(error.response?.data?.message || 'something went wrong')
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('delete task?')) return
    await api.delete(`/tasks/${taskId}`)
    fetchAll()
  }

  // member can quickly change their task status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus })
      fetchAll()
    } catch (err) {
      alert('could not update status')
    }
  }

  const statusBadge = (status) => {
    if (status === 'todo') return <span className="badge badge-todo">todo</span>
    if (status === 'in-progress') return <span className="badge badge-inprogress">in progress</span>
    return <span className="badge badge-done">done</span>
  }

  if (!project) return <div className="container" style={{ marginTop: 30 }}>Loading...</div>

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2>{project.name}</h2>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{project.description}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>
        )}
      </div>

      <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
        Members: {project.members?.map(m => m.name).join(', ') || 'none'}
      </p>

      {tasks.length === 0 && <p style={{ color: '#888', fontSize: '14px' }}>No tasks in this project yet.</p>}

      {tasks.map(task => (
        <div className="task-item" key={task._id}>
          <div>
            <div className="task-title">
              {task.title}
              {statusBadge(task.status)}
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            </div>
            <div className="task-meta">
              Assigned to: {task.assignedTo?.name || 'unassigned'} &nbsp;|&nbsp;
              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
            </div>
            {task.description && <div className="task-meta">{task.description}</div>}
          </div>
          <div className="task-actions">
            {/* member can change status of their own tasks */}
            {user?.role === 'member' && String(task.assignedTo?._id) === String(user._id) && (
              <select
                value={task.status}
                onChange={e => handleStatusChange(task._id, e.target.value)}
                style={{ fontSize: '13px', padding: '4px' }}
              >
                <option value="todo">todo</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>
            )}
            {user?.role === 'admin' && (
              <>
                <button className="btn btn-sm btn-primary" onClick={() => openEdit(task)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task._id)}>Delete</button>
              </>
            )}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editTask ? 'Edit Task' : 'New Task'}</h3>
            {err && <p className="error-msg">{err}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="task name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="optional"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">-- unassigned --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
