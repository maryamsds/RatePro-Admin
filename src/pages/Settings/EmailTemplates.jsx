// src/pages/Settings/EmailTemplates.jsx
"use client"

import { useState } from "react"
import { MdEdit, MdSave, MdDelete, MdAdd } from "react-icons/md"

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Low Rating Notification',
      subject: 'We value your feedback',
      body: 'Dear {customer_name},\n\nThank you for your feedback. We apologize for your experience and would like to make it right.\n\nSincerely,\n{company_name}'
    },
    {
      id: 2,
      name: 'Survey Invitation',
      subject: 'Share your feedback with us',
      body: 'Dear {customer_name},\n\nWe would love to hear your thoughts about our service.\n\n{survey_link}\n\nThank you!\n{company_name}'
    }
  ])
  const [editingId, setEditingId] = useState(null)
  const [currentTemplate, setCurrentTemplate] = useState({
    name: '',
    subject: '',
    body: ''
  })

  const handleEdit = (template) => {
    setEditingId(template.id)
    setCurrentTemplate({
      name: template.name,
      subject: template.subject,
      body: template.body
    })
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editingId) {
      setTemplates(templates.map(t => 
        t.id === editingId ? { ...t, ...currentTemplate } : t
      ))
    } else {
      setTemplates([...templates, {
        id: Date.now(),
        ...currentTemplate
      }])
    }
    setEditingId(null)
    setCurrentTemplate({ name: '', subject: '', body: '' })
  }

  const handleDelete = (id) => {
    setTemplates(templates.filter(t => t.id !== id))
  }

  return (
    <div className="email-templates">
      <div className="page-header">
        <h1>Email Templates</h1>
      </div>

      <div className="template-editor">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Template Name</label>
            <input
              type="text"
              value={currentTemplate.name}
              onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={currentTemplate.subject}
              onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Body</label>
            <textarea
              value={currentTemplate.body}
              onChange={(e) => setCurrentTemplate({...currentTemplate, body: e.target.value})}
              rows={10}
              required
            />
            <div className="variables">
              <p>Available variables:</p>
              <ul>
                <li>{'{customer_name}'} - Customer's name</li>
                <li>{'{company_name}'} - Your company name</li>
                <li>{'{survey_link}'} - Link to the survey</li>
                <li>{'{rating}'} - Customer's rating</li>
              </ul>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <MdSave /> {editingId ? 'Update Template' : 'Save Template'}
          </button>
        </form>
      </div>

      <div className="templates-list">
        <h2>Saved Templates</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Subject</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(template => (
              <tr key={template.id}>
                <td>{template.name}</td>
                <td>{template.subject}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline-primary mr-2"
                    onClick={() => handleEdit(template)}
                  >
                    <MdEdit />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(template.id)}
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmailTemplates