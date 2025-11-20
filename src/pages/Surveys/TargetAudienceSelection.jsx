import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Form, Alert, Spinner, Modal, Table, FormControl, InputGroup } from 'react-bootstrap';
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

  // Target audience options with descriptions
  // const audienceOptions = [
  //   {
  //     id: 'employee',
  //     name: 'Employees',
  //     icon: MdBusiness,
  //     color: '#0d6efd',
  //     description: 'Internal staff members, managers, and departments',
  //     examples: 'HR feedback, performance reviews, workplace satisfaction'
  //   },
  //   {
  //     id: 'customer',
  //     name: 'Customers',
  //     icon: MdPeople,
  //     color: '#198754',
  //     description: 'Your clients, customers, and service users',
  //     examples: 'Product feedback, service quality, customer satisfaction'
  //   },
  //   {
  //     id: 'public',
  //     name: 'General Public',
  //     icon: MdPublic,
  //     color: '#6f42c1',
  //     description: 'Anyone with the survey link can participate',
  //     examples: 'Market research, brand awareness, public opinion'
  //   },
  //   {
  //     id: 'vendor',
  //     name: 'Vendors/Partners',
  //     icon: MdLocalShipping,
  //     color: '#fd7e14',
  //     description: 'Business partners, suppliers, and vendors',
  //     examples: 'Partnership feedback, supplier evaluation, collaboration'
  //   },
  //   {
  //     id: 'guest',
  //     name: 'Guests/Visitors',
  //     icon: MdHotel,
  //     color: '#20c997',
  //     description: 'Hotel guests, event attendees, facility visitors',
  //     examples: 'Hospitality feedback, event satisfaction, facility reviews'
  //   },
  //   {
  //     id: 'student',
  //     name: 'Students',
  //     icon: MdSchool,
  //     color: '#dc3545',
  //     description: 'Students, trainees, and course participants',
  //     examples: 'Course evaluation, training feedback, educational experience'
  //   },
  //   {
  //     id: 'patient',
  //     name: 'Patients',
  //     icon: MdLocalHospital,
  //     color: '#0dcaf0',
  //     description: 'Healthcare patients and medical service users',
  //     examples: 'Healthcare experience, treatment satisfaction, medical services'
  //   }
  // ];

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
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">Select Target Audience</h2>
        <p className="text-muted">
          Choose who should receive and respond to your survey: <strong>{survey?.title || 'Your Survey'}</strong>
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Target Audience Dropdown with Segments and Categories */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Select from Segments & Categories</h5>
          <Form.Group>
            <Form.Label>Target Audience</Form.Label>
            <Form.Select 
              size="lg"
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
            </Form.Select>
            <Form.Text className="text-muted">
              Select audience segments, contact categories, or choose custom contacts
            </Form.Text>
          </Form.Group>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4 mb-4">
        {audienceOptions.map((audience) => {
          const isSelected = selectedAudiences.includes(audience.id);
          const IconComponent = audience.icon;

          return (
            <Col key={audience.id} lg={6} xl={4}>
              <Card 
                className={`h-100 cursor-pointer border-2 audience-card ${
                  isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                }`}
                onClick={() => handleAudienceToggle(audience.id)}
                style={{ 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <Card.Body className="p-4 text-center">
                  <div className="position-relative mb-3">
                    <IconComponent 
                      size={48} 
                      style={{ color: audience.color }}
                    />
                    {isSelected && (
                      <MdCheckCircle 
                        size={20} 
                        className="position-absolute top-0 end-0 text-success"
                        style={{ marginTop: '-8px', marginRight: '-8px' }}
                      />
                    )}
                  </div>
                  
                  <h5 className={`fw-bold mb-2 ${isSelected ? 'text-primary' : ''}`}>
                    {audience.name}
                  </h5>
                  
                  <p className="text-muted small mb-3">
                    {audience.description}
                  </p>
                  
                  <div className="small text-secondary">
                    <strong>Examples:</strong> {audience.examples}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Selection Summary */}
      {getSelectedCount() > 0 && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex align-items-center">
            <MdCheckCircle className="me-2 text-success" />
            <div>
              <strong>Selected Audiences ({getSelectedCount()}):</strong>
              <div className="mt-1">{getSelectedNames()}</div>
              {selectedContacts.length > 0 && (
                <div className="mt-2">
                  <strong>Custom Contacts:</strong> {selectedContacts.length} selected
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowCustomModal(true)}
                    className="p-0 ms-2"
                  >
                    View/Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          ← Back to Survey
        </Button>

        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary"
            onClick={() => setSelectedAudiences(['public'])}
            disabled={loading}
          >
            Reset to Public
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading || getSelectedCount() === 0}
            className="d-flex align-items-center"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                Continue to Schedule →
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <Alert variant="light" className="mt-4 border">
        <h6 className="fw-bold mb-2">💡 Pro Tips:</h6>
        <ul className="small mb-0">
          <li>You can select multiple audiences for broader reach</li>
          <li>Choose audiences that best represent your survey goals</li>
          <li>Different audiences may require different question approaches</li>
          <li>You can change this later in survey settings</li>
        </ul>
      </Alert>

      {/* Custom Contacts Selection Modal */}
      <Modal 
        show={showCustomModal} 
        onHide={handleModalClose}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Custom Contacts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Search Bar */}
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <MdSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            {searchQuery && (
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <MdClose />
              </Button>
            )}
          </InputGroup>

          {/* Selected Count */}
          {selectedContacts.length > 0 && (
            <Alert variant="success" className="py-2">
              <strong>{selectedContacts.length}</strong> contact(s) selected
            </Alert>
          )}

          {/* Contacts Table */}
          {contactsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <Alert variant="info">
              No contacts found. {searchQuery && 'Try adjusting your search.'}
            </Alert>
          ) : (
            <>
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table hover>
                  <thead className="sticky-top bg-light">
                    <tr>
                      <th style={{ width: '50px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={contacts.length > 0 && contacts.every(contact => 
                            selectedContacts.some(sc => sc._id === contact._id)
                          )}
                          onChange={handleSelectAllContacts}
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map(contact => (
                      <tr 
                        key={contact._id}
                        onClick={() => handleContactToggle(contact)}
                        style={{ cursor: 'pointer' }}
                        className={isContactSelected(contact) ? 'table-active' : ''}
                      >
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={isContactSelected(contact)}
                            onChange={() => handleContactToggle(contact)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>{contact.name || 'N/A'}</td>
                        <td>{contact.email || 'N/A'}</td>
                        <td>{contact.company || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted small">
                    Showing {((currentPage - 1) * contactsPerPage) + 1} to {Math.min(currentPage * contactsPerPage, totalContacts)} of {totalContacts}
                  </div>
                  <div className="btn-group">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button variant="outline-primary" size="sm" disabled>
                      Page {currentPage} of {totalPages}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalConfirm}>
            Confirm Selection ({selectedContacts.length})
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TargetAudienceSelection;