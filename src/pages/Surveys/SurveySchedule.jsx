// src/pages/SurveySchedule/SurveySchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import {
  MdCalendarToday,
  MdAccessTime,
  MdSend,
  MdSchedule,
  MdAutorenew,
  MdInfo,
  MdArrowBack,
  MdArrowForward,
  MdPeople,
  MdPublish,
  // MdDraft
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const SurveySchedule = ({ onSchedule }) => {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  // Get survey data from location state
  const surveyData = location.state?.survey;
  const fromAudienceSelection = location.state?.fromAudienceSelection;

  const [survey, setSurvey] = useState(surveyData || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [schedule, setSchedule] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    autoPublish: true,
    repeat: {
      enabled: false,
      frequency: 'none',
      endRepeatDate: ''
    }
  });

  // Audience options for display
  const audienceOptions = {
    'employee': { name: 'Employees', icon: '👥', color: '#0d6efd' },
    'customer': { name: 'Customers', icon: '🛍️', color: '#198754' },
    'public': { name: 'General Public', icon: '🌍', color: '#6f42c1' },
    'vendor': { name: 'Vendors/Partners', icon: '🚚', color: '#fd7e14' },
    'guest': { name: 'Guests/Visitors', icon: '🏨', color: '#20c997' },
    'student': { name: 'Students', icon: '🎓', color: '#dc3545' },
    'patient': { name: 'Patients', icon: '🏥', color: '#0dcaf0' },
    'all': { name: 'All Audiences', icon: '👤', color: '#6c757d' }
  };

  // Fetch survey data if not provided
  useEffect(() => {
    if (!survey && surveyId) {
      fetchSurveyData();
    }
  }, [surveyId, survey]);

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/surveys/${surveyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSurvey(response.data);

      // Set existing schedule if available
      if (response.data.schedule) {
        const existingSchedule = response.data.schedule;
        setSchedule({
          startDate: existingSchedule.startDate ? existingSchedule.startDate.split('T')[0] : '',
          startTime: existingSchedule.startDate ? existingSchedule.startDate.split('T')[1]?.substring(0, 5) : '',
          endDate: existingSchedule.endDate ? existingSchedule.endDate.split('T')[0] : '',
          endTime: existingSchedule.endDate ? existingSchedule.endDate.split('T')[1]?.substring(0, 5) : '',
          timezone: existingSchedule.timezone || 'UTC',
          autoPublish: existingSchedule.autoPublish || false,
          repeat: existingSchedule.repeat || { enabled: false, frequency: 'none', endRepeatDate: '' }
        });
      }
    } catch (err) {
      console.error('Error fetching survey:', err);
      setError('Failed to load survey data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('repeat.')) {
      const repeatField = name.split('.')[1];
      setSchedule(prev => ({
        ...prev,
        repeat: {
          ...prev.repeat,
          [repeatField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSchedule(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!schedule.startDate || !schedule.startTime) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please provide start date and time.',
        icon: 'warning',
        confirmButtonColor: 'var(--bs-warning)'
      });
      return;
    }

    // Create datetime strings
    const startDateTime = new Date(`${schedule.startDate}T${schedule.startTime}`);
    const endDateTime = schedule.endDate && schedule.endTime
      ? new Date(`${schedule.endDate}T${schedule.endTime}`)
      : null;

    // Validation: start time should be in future (unless it's immediate)
    const now = new Date();
    if (startDateTime <= now && schedule.autoPublish) {
      const result = await Swal.fire({
        title: 'Past Date/Time',
        text: 'The start time is in the past. The survey will be published immediately. Continue?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--bs-primary)',
        cancelButtonColor: 'var(--bs-secondary)',
        confirmButtonText: 'Publish Now',
        cancelButtonText: 'Change Time'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    // Validation: end time should be after start time
    if (endDateTime && endDateTime <= startDateTime) {
      Swal.fire({
        title: 'Invalid End Time',
        text: 'End time must be after start time.',
        icon: 'error',
        confirmButtonColor: 'var(--bs-danger)'
      });
      return;
    }

    try {
      setSaving(true);

      const scheduleData = {
        startDate: startDateTime.toISOString(),
        endDate: endDateTime ? endDateTime.toISOString() : null,
        timezone: schedule.timezone,
        autoPublish: schedule.autoPublish,
        repeat: schedule.repeat.enabled ? {
          enabled: true,
          frequency: schedule.repeat.frequency,
          endRepeatDate: schedule.repeat.endRepeatDate || null
        } : { enabled: false, frequency: 'none' }
      };

      // If the repeat frequency is "none", remove it from the payload
      if (surveyData.schedule?.repeat?.frequency === "none") {
        delete surveyData.schedule.repeat.frequency;

        // If repeat is now empty, remove repeat entirely
        if (Object.keys(surveyData.schedule.repeat).length === 0) {
          delete surveyData.schedule.repeat;
        }
      }

      const response = await axios.put(`/api/surveys/${surveyId}/schedule`, scheduleData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Success message
      const publishTime = startDateTime <= now ? 'immediately' : `at ${startDateTime.toLocaleString()}`;

      await Swal.fire({
        title: 'Survey Scheduled!',
        text: `Your survey will be ${schedule.autoPublish ? 'published' : 'available'} ${publishTime}.`,
        icon: 'success',
        confirmButtonColor: 'var(--bs-success)',
        timer: 3000,
        showConfirmButton: false
      });

      // Call onSchedule if provided (for embedded use)
      if (onSchedule) {
        onSchedule(response.data.survey);
      } else {
        // Navigate back to surveys list
        setTimeout(() => {
          navigate('/app/surveys');
        }, 2000);
      }

    } catch (err) {
      console.error('Error scheduling survey:', err);
      Swal.fire({
        title: 'Scheduling Failed',
        text: err.response?.data?.message || 'Failed to schedule survey. Please try again.',
        icon: 'error',
        confirmButtonColor: 'var(--bs-danger)'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h5>Loading survey data...</h5>
        </div>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="w-full flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <h5 className="text-red-700">Error Loading Survey</h5>
          <p className="text-red-600">{error}</p>
          <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors" onClick={() => navigate('/app/surveys')}>
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-schedule py-4 w-full px-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="mb-1">Schedule Survey</h2>
            <p className="text-muted mb-0">
              Set when your survey should be published: <strong>{survey?.title}</strong>
            </p>
          </div>
          <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">Step 3 of 3</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full mb-3" style={{ height: '8px' }}>
          <div className="h-full bg-[var(--primary-color)] rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {/* Survey & Audience Summary */}
          {survey && (
            <div className="mb-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-4">
              <h6 className="fw-bold mb-3 flex align-items-center">
                <MdInfo className="me-2" />
                Survey Summary
              </h6>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2">
                    <small className="text-muted">Survey Title:</small>
                    <div className="fw-semibold">{survey.title}</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Status:</small>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${survey.status === 'active' ? 'bg-green-500' : survey.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                        {survey.status === 'active' && <MdPublish className="me-1" />}
                        {survey.status === 'draft' && <MdDraft className="me-1" />}
                        {survey.status || 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <small className="text-muted">Target Audience:</small>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(survey.targetAudience || ['public']).map(audienceId => {
                        const audience = audienceOptions[audienceId];
                        return audience ? (
                          <span key={audienceId} className="inline-flex items-center px-2 py-0.5 bg-[var(--primary-color)] text-white text-xs rounded">
                            {audience.icon} {audience.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Questions:</small>
                    <div className="fw-semibold">{survey.questions?.length || 0} questions</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Scheduling Form */}
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]">
            <div className="flex items-center p-4 border-b border-[var(--border-color)]">
              <MdSchedule className="me-2" />
              <strong>Schedule Settings</strong>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit}>
                {/* Auto-Publish Toggle */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      role="switch"
                      id="auto-publish"
                      name="autoPublish"
                      checked={schedule.autoPublish}
                      onChange={handleChange}
                      className="w-10 h-5 appearance-none bg-gray-300 rounded-full checked:bg-[var(--primary-color)] transition-colors cursor-pointer relative
                        before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
                    />
                    <span className="font-medium">Enable Auto-Publishing</span>
                  </label>
                  <small className="text-muted">
                    {schedule.autoPublish
                      ? 'Survey will automatically become active at the specified start time.'
                      : 'Survey will be scheduled but you\'ll need to manually publish it.'
                    }
                  </small>
                </div>

                {/* Start Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="mb-3">
                      <label className="font-semibold flex items-center mb-1">
                        <MdCalendarToday className="me-2" />
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={schedule.startDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-3">
                      <label className="font-semibold flex items-center mb-1">
                        <MdAccessTime className="me-2" />
                        Start Time *
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={schedule.startTime}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                      />
                    </div>
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="mb-3">
                      <label className="font-semibold mb-1 block">End Date (Optional)</label>
                      <input
                        type="date"
                        name="endDate"
                        value={schedule.endDate}
                        onChange={handleChange}
                        min={schedule.startDate}
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                      />
                      <small className="text-muted">
                        Leave empty for unlimited duration
                      </small>
                    </div>
                  </div>
                  <div>
                    <div className="mb-3">
                      <label className="font-semibold mb-1 block">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={schedule.endTime}
                        onChange={handleChange}
                        disabled={!schedule.endDate}
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Timezone */}
                <div className="mb-4">
                  <label className="font-semibold mb-1 block">Timezone</label>
                  <select
                    name="timezone"
                    value={schedule.timezone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>

                {/* Repeat Settings */}
                <div className="mb-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <div className="flex items-center p-4 pb-0">
                    <MdAutorenew className="me-2" />
                    <strong>Repeat Settings</strong>
                  </div>
                  <div className="p-4 pt-3">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        role="switch"
                        id="repeat-enabled"
                        name="repeat.enabled"
                        checked={schedule.repeat.enabled}
                        onChange={handleChange}
                        className="w-10 h-5 appearance-none bg-gray-300 rounded-full checked:bg-[var(--primary-color)] transition-colors cursor-pointer relative
                          before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
                      />
                      <span>Repeat this survey</span>
                    </label>

                    {schedule.repeat.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="mb-3">
                            <label className="block mb-1">Frequency</label>
                            <select
                              name="repeat.frequency"
                              value={schedule.repeat.frequency}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <div className="mb-3">
                            <label className="block mb-1">Stop Repeating On</label>
                            <input
                              type="date"
                              name="repeat.endRepeatDate"
                              value={schedule.repeat.endRepeatDate}
                              onChange={handleChange}
                              min={schedule.startDate}
                              className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-content-between align-items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/app/surveys')}
                    disabled={saving}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <MdArrowBack className="me-2" />
                    Cancel
                  </button>

                  <div className="flex gap-2">
                    {fromAudienceSelection && (
                      <button
                        type="button"
                        className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors disabled:opacity-50"
                        onClick={() => navigate(`/app/surveys/${surveyId}/target-audience`)}
                        disabled={saving}
                      >
                        ← Back to Audience
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2"></div>
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <MdSend className="me-2" />
                          {schedule.autoPublish ? 'Schedule & Publish' : 'Save Schedule'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          {/* Schedule Preview */}
          <div className="sticky top-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]">
            <div className="p-4 border-b border-[var(--border-color)]">
              <strong>Schedule Preview</strong>
            </div>
            <div className="p-4">
              {schedule.startDate && schedule.startTime ? (
                <div>
                  <div className="mb-3">
                    <small className="text-muted">Survey will start:</small>
                    <div className="fw-bold text-success">
                      {new Date(`${schedule.startDate}T${schedule.startTime}`).toLocaleString()}
                    </div>
                  </div>

                  {schedule.endDate && schedule.endTime && (
                    <div className="mb-3">
                      <small className="text-muted">Survey will end:</small>
                      <div className="fw-bold text-danger">
                        {new Date(`${schedule.endDate}T${schedule.endTime}`).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <small className="text-muted">Timezone:</small>
                    <div className="fw-semibold">{schedule.timezone}</div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Auto-publish:</small>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${schedule.autoPublish ? 'bg-green-500' : 'bg-yellow-500'}`}>
                        {schedule.autoPublish ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {schedule.repeat.enabled && (
                    <div className="mb-3">
                      <small className="text-muted">Repeat:</small>
                      <div className="fw-semibold text-info">
                        {schedule.repeat.frequency}
                        {schedule.repeat.endRepeatDate && (
                          <small className="d-block text-muted">
                            Until: {new Date(schedule.repeat.endRepeatDate).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <MdSchedule size={48} className="mb-2" />
                  <p>Set start date and time to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveySchedule