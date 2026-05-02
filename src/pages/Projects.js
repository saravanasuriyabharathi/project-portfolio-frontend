import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', members: [] })
  const [err, setErr] = useState('')

  const fetchProjects = async () => {
    const res = await api.get('/projects')
    setProjects(res.data)
  }

  const fetchUsers = async () => {
    const res = await api.get('/users')
    setUsers(res.data)
  }

  useEffect(() => {
    fetchProjects()
    if (user?.role === 'admin') fetchUsers()
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await api.post('/projects', form)
      setForm({ name: '', description: '', members: [] })
      setShowModal(false)
      fetchProjects()
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to create project')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('delete this project?')) return
    await api.delete(`/projects/${id}`)
    fetchProjects()
  }

  const toggleMember = (userId) => {
    const current = form.members
    if (current.includes(userId)) {
      setForm({ ...form, members: current.filter(id => id !== userId) })
    } else {
      setForm({ ...form, members: [...current, userId] })
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Projects</h2>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 && <p style={{ color: '#888', fontSize: '14px' }}>No projects found.</p>}

      {projects.map(proj => (
        <div className="card" key={proj._id}>
          <h3><Link to={`/projects/${proj._id}`} style={{ color: '#1a73e8', textDecoration: 'none' }}>{proj.name}</Link></h3>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>{proj.description || 'no description'}</p>
          <p style={{ fontSize: '12px', color: '#888' }}>
            Members: {proj.members?.map(m => m.name).join(', ') || 'none'}
          </p>
          {user?.role === 'admin' && (
            <div style={{ marginTop: '10px' }}>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj._id)}>Delete</button>
            </div>
          )}
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Create Project</h3>
            {err && <p className="error-msg">{err}</p>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="project name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="what is this project about"
                />
              </div>
              <div className="form-group">
                <label>Add Members</label>
                {users.filter(u => u._id !== user._id).map(u => (
                  <div key={u._id} style={{ marginBottom: '5px', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={form.members.includes(u._id)}
                      onChange={() => toggleMember(u._id)}
                      style={{ marginRight: '6px' }}
                    />
                    {u.name} ({u.email})
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
