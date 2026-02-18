import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdPeople, MdBusiness, MdPublic, MdLocalShipping, MdHotel, MdSchool, MdLocalHospital, MdCheckCircle, MdSearch, MdClose } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { axiosInstance } from '../../api/axiosInstance';
import Swal from 'sweetalert2';

const TargetAudienceSelection = ({ survey, onNext }) => {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const { user } = useAuth();
  const [selectedAudiences, setSelectedAudiences] = useState(['public']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New state for segments, categories, and custom contacts
  const [segments, setSegments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const contactsPerPage = 10;

  // Fetch active segments and contact categories on mount
  useEffect(() => {
    fetchSegmentsAndCategories();
  }, []);

  // Fetch contacts when modal opens or search/page changes
  useEffect(() => {
    if (showCustomModal) {
      fetchContacts();
    }
  }, [showCustomModal, searchQuery, currentPage]);

  const fetchSegmentsAndCategories = async () => {
    try {
      // Fetch active segments
      const segmentsResponse = await axiosInstance.get('/audience-segmentation/all');
      if (segmentsResponse.data.success) {
        // Filter only active segments
        const activeSegments = segmentsResponse.data.segments.filter(seg => seg.status === 'active');
        setSegments(activeSegments);
      }

      // Fetch contact categories
      const categoriesResponse = await axiosInstance.get('/contact-categories');
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching segments/categories:', err);
    }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const response = await axiosInstance.get('/contacts', {
        params: {
          page: currentPage,
          limit: contactsPerPage,
          search: searchQuery
        }
      });

      if (response.data) {
        setContacts(response.data.contacts || []);
        setTotalContacts(response.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleCustomOptionSelect = () => {
    setShowCustomModal(true);
  };

  const handleContactToggle = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c._id === contact._id);
      if (isSelected) {
        return prev.filter(c => c._id !== contact._id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleSelectAllContacts = () => {
    const allSelected = contacts.every(contact =>
      selectedContacts.some(sc => sc._id === contact._id)
    );

    if (allSelected) {
      // Deselect all current page contacts
      setSelectedContacts(prev =>
        prev.filter(sc => !contacts.some(c => c._id === sc._id))
      );
    } else {
      // Select all current page contacts
      const newSelections = contacts.filter(contact =>
        !selectedContacts.some(sc => sc._id === contact._id)
      );
      setSelectedContacts(prev => [...prev, ...newSelections]);
    }
  };

  const handleModalClose = () => {
    setShowCustomModal(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleModalConfirm = () => {
    // Keep selected contacts and close modal
    setShowCustomModal(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const isContactSelected = (contact) => {
    return selectedContacts.some(c => c._id === contact._id);
  };

  const totalPages = Math.ceil(totalContacts / contactsPerPage);

  const handleAudienceToggle = (audienceId) => {
    setSelectedAudiences(prev => {
      if (prev.includes(audienceId)) {
        // Don't allow deselecting if it's the only selected option
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== audienceId);
      } else {
        return [...prev, audienceId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedAudiences.length === 0) {
      setError('Please select at least one target audience');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/surveys/${surveyId}/target-audience`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          targetAudience: selectedAudiences,
          customContacts: selectedContacts.map(c => c._id) // Include selected contact IDs
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save target audience');
      }

      // Show success message
      await Swal.fire({
        title: 'Target Audience Set!',
        text: `Your survey will be available to: ${selectedAudiences.map(id => {
          // Check if it's a segment
          const segment = segments.find(s => s._id === id);
          if (segment) return segment.name;

          // Check if it's a category
          const category = categories.find(c => c._id === id);
          if (category) return category.name;

          // Check if it's a predefined audience
          const audience = audienceOptions.find(opt => opt.id === id);
          return audience?.name || id;
        }).join(', ')}${selectedContacts.length > 0 ? ` + ${selectedContacts.length} custom contacts` : ''}`,
        icon: 'success',
        confirmButtonColor: 'var(--bs-success)',
        confirmButtonText: 'Continue to Schedule'
      });

      // Navigate to schedule page or call onNext if provided
      if (onNext) {
        onNext(data.survey);
      } else {
        navigate(`/surveys/${surveyId}/schedule`, {
          state: { survey: data.survey }
        });
      }

    } catch (err) {
      console.error('Error saving target audience:', err);
      setError(err.message || 'Failed to save target audience. Please try again.');

      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to save target audience. Please try again.',
        icon: 'error',
        confirmButtonColor: 'var(--bs-danger)'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCount = () => selectedAudiences.length;
  const getSelectedNames = () => {
    return selectedAudiences.map(id => {
      // Check if it's a segment
      const segment = segments.find(s => s._id === id);
      if (segment) return segment.name;

      // Check if it's a category
      const category = categories.find(c => c._id === id);
      if (category) return category.name;

      // Check if it's a predefined audience
      const audience = audienceOptions.find(opt => opt.id === id);
      return audience?.name || id;
    }).join(', ');
  };

  return (
    <div className="w-full py-4 px-4">
      <div className="text-center mb-4">
        <h2 className="font-bold text-[var(--primary-color)]">Select Target Audience</h2>
        <p className="text-muted">
          Choose who should receive and respond to your survey: <strong>{survey?.title || 'Your Survey'}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {/* Target Audience Dropdown with Segments and Categories */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl mb-4">
        <div className="p-4">
          <h5 className="font-bold mb-3">Select from Segments & Categories</h5>
          <div>
            <label className="block text-sm font-medium mb-1">Target Audience</label>
            <select
              className="w-full px-4 py-3 text-base border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)] text-[var(--text-primary)] cursor-pointer"
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  handleCustomOptionSelect();
                } else if (value) {
                  handleAudienceToggle(value);
                }
                e.target.value = ''; // Reset dropdown
              }}
            >
              <option value="">Choose an audience...</option>

              {/* Active Segments */}
              {segments.length > 0 && (
                <optgroup label="📊 Audience Segments">
                  {segments.map(segment => (
                    <option key={segment._id} value={segment._id}>
                      {segment.name} ({segment.size || 0} contacts)
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Contact Categories */}
              {categories.length > 0 && (
                <optgroup label="📁 Contact Categories">
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name} ({category.type})
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Custom Option */}
              <optgroup label="✨ Custom Selection">
                <option value="custom">Select Individual Contacts...</option>
              </optgroup>
            </select>
            <p className="text-sm text-muted mt-1">
              Select audience segments, contact categories, or choose custom contacts
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        {audienceOptions.map((audience) => {
          const isSelected = selectedAudiences.includes(audience.id);
          const IconComponent = audience.icon;

          return (
            <div
              key={audience.id}
              className={`bg-[var(--card-bg)] border-2 rounded-xl h-full cursor-pointer transition-all duration-300 hover:shadow-md ${isSelected ? 'border-[var(--primary-color)] bg-blue-50/50' : 'border-[var(--border-color)]'
                }`}
              onClick={() => handleAudienceToggle(audience.id)}
            >
              <div className="p-4 text-center">
                <div className="relative mb-3 inline-block">
                  <IconComponent
                    size={48}
                    style={{ color: audience.color }}
                  />
                  {isSelected && (
                    <MdCheckCircle
                      size={20}
                      className="absolute -top-2 -right-2 text-green-500"
                    />
                  )}
                </div>

                <h5 className={`font-bold mb-2 ${isSelected ? 'text-[var(--primary-color)]' : ''}`}>
                  {audience.name}
                </h5>

                <p className="text-muted text-sm mb-3">
                  {audience.description}
                </p>

                <div className="text-sm text-gray-500">
                  <strong>Examples:</strong> {audience.examples}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {getSelectedCount() > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <MdCheckCircle className="me-2 text-green-600" />
            <div>
              <strong>Selected Audiences ({getSelectedCount()}):</strong>
              <div className="mt-1">{getSelectedNames()}</div>
              {selectedContacts.length > 0 && (
                <div className="mt-2">
                  <strong>Custom Contacts:</strong> {selectedContacts.length} selected
                  <button
                    className="text-[var(--primary-color)] hover:underline text-sm ms-2 bg-transparent border-none cursor-pointer p-0"
                    onClick={() => setShowCustomModal(true)}
                  >
                    View/Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          ← Back to Survey
        </button>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            onClick={() => setSelectedAudiences(['public'])}
            disabled={loading}
          >
            Reset to Public
          </button>

          <button
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center"
            onClick={handleSubmit}
            disabled={loading || getSelectedCount() === 0}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                Saving...
              </>
            ) : (
              <>
                Continue to Schedule →
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-[var(--border-color)] rounded-lg p-4 mt-4">
        <h6 className="font-bold mb-2">💡 Pro Tips:</h6>
        <ul className="text-sm mb-0 list-disc pl-5 space-y-1">
          <li>You can select multiple audiences for broader reach</li>
          <li>Choose audiences that best represent your survey goals</li>
          <li>Different audiences may require different question approaches</li>
          <li>You can change this later in survey settings</li>
        </ul>
      </div>

      {/* Custom Contacts Selection Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleModalClose}></div>
          <div className="relative bg-[var(--card-bg)] rounded-xl shadow-2xl w-full max-w-3xl mx-4 z-10 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h5 className="font-semibold text-lg">Select Custom Contacts</h5>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={handleModalClose}>&times;</button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Search Bar */}
              <div className="flex items-center border border-[var(--border-color)] rounded-lg mb-3 overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-r border-[var(--border-color)]">
                  <MdSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border-none outline-none bg-[var(--card-bg)] text-[var(--text-primary)]"
                  placeholder="Search by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
                {searchQuery && (
                  <button
                    className="px-3 py-2 text-gray-400 hover:text-gray-600 border-l border-[var(--border-color)]"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                  >
                    <MdClose />
                  </button>
                )}
              </div>

              {/* Selected Count */}
              {selectedContacts.length > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 mb-3">
                  <strong>{selectedContacts.length}</strong> contact(s) selected
                </div>
              )}

              {/* Contacts Table */}
              {contactsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                  <p className="mt-2 text-muted">Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-3">
                  No contacts found. {searchQuery && 'Try adjusting your search.'}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="w-full">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left" style={{ width: '50px' }}>
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 cursor-pointer"
                              checked={contacts.length > 0 && contacts.every(contact =>
                                selectedContacts.some(sc => sc._id === contact._id)
                              )}
                              onChange={handleSelectAllContacts}
                            />
                          </th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Email</th>
                          <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Company</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {contacts.map(contact => (
                          <tr
                            key={contact._id}
                            onClick={() => handleContactToggle(contact)}
                            className={`cursor-pointer transition-colors ${isContactSelected(contact) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 cursor-pointer"
                                checked={isContactSelected(contact)}
                                onChange={() => handleContactToggle(contact)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-3 py-2 text-sm">{contact.name || 'N/A'}</td>
                            <td className="px-3 py-2 text-sm">{contact.email || 'N/A'}</td>
                            <td className="px-3 py-2 text-sm">{contact.company || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-muted text-sm">
                        Showing {((currentPage - 1) * contactsPerPage) + 1} to {Math.min(currentPage * contactsPerPage, totalContacts)} of {totalContacts}
                      </div>
                      <div className="flex">
                        <button
                          className="px-3 py-1.5 text-sm border border-[var(--primary-color)] text-[var(--primary-color)] rounded-l-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                          Previous
                        </button>
                        <button className="px-3 py-1.5 text-sm border-y border-[var(--primary-color)] text-[var(--primary-color)] bg-blue-50" disabled>
                          Page {currentPage} of {totalPages}
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm border border-[var(--primary-color)] text-[var(--primary-color)] rounded-r-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border-color)]">
              <button className="px-4 py-2 text-sm border border-[var(--border-color)] rounded-lg hover:bg-gray-100 transition-colors" onClick={handleModalClose}>
                Cancel
              </button>
              <button className="px-4 py-2 text-sm bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition-colors" onClick={handleModalConfirm}>
                Confirm Selection ({selectedContacts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetAudienceSelection;