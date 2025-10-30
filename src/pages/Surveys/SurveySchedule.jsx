// src/pages/SurveySchedule/SurveySchedule.jsx
"use client"

import { useState } from "react"
import { MdCalendarToday, MdAccessTime, MdSend } from "react-icons/md"

const SurveySchedule = ({ onSchedule }) => {
  const [schedule, setSchedule] = useState({
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    repeat: 'none',
    endDate: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setSchedule(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSchedule(schedule)
  }

  return (
    <div className="survey-schedule">
      <h3>Schedule Survey</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>
              <MdCalendarToday /> Start Date
            </label>
            <input
              type="date"
              name="date"
              value={schedule.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <MdAccessTime /> Time
            </label>
            <input
              type="time"
              name="time"
              value={schedule.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Timezone</label>
          <select
            name="timezone"
            value={schedule.timezone}
            onChange={handleChange}
            required
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div className="form-group">
          <label>Repeat</label>
          <select
            name="repeat"
            value={schedule.repeat}
            onChange={handleChange}
          >
            <option value="none">Don't repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {schedule.repeat !== 'none' && (
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={schedule.endDate}
              onChange={handleChange}
              required={schedule.repeat !== 'none'}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          <MdSend /> Schedule
        </button>
      </form>
    </div>
  )
}

export default SurveySchedule