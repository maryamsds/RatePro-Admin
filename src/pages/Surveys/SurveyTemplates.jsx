import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Form,
  InputGroup, Modal, Spinner, Alert, Offcanvas,
  OverlayTrigger, Tooltip
} from 'react-bootstrap';
import {
  MdDescription, MdAdd, MdSearch, MdFilterList,
  MdVisibility, MdEdit, MdContentCopy, MdStar,
  MdBusiness, MdSchool, MdLocalHospital, MdHotel,
  MdSports, MdAccountBalance, MdShoppingCart,
  MdLocationCity, MdConstruction, MdDirectionsCar,
  MdComputer, MdCategory
} from 'react-icons/md';
import { FaUsers, FaChartBar, FaClock, FaLanguage } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination/Pagination';
import Swal from 'sweetalert2';


const SurveyTemplates = ({ darkMode }) => {
  const navigate = useNavigate();
  const { setGlobalLoading } = useAuth();
  
  // State Management
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  
  // Modal States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Pagination State
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });
  
  // Template Categories - Complete client requirements - Use useMemo to prevent dependency issues
  const categories = React.useMemo(() => [
    {
      id: 'corporate',
      name: 'Corporate / HR',
      icon: MdBusiness,
      color: '#007bff',
      description: 'Employee engagement, satisfaction, and HR processes',
      templates: [
        'Employee Engagement Survey',
        'Employee Satisfaction Survey', 
        'Onboarding Experience Survey',
        'Training Effectiveness Survey',
        'Exit Interview Survey',
        'Diversity & Inclusion Survey',
        'Remote Work Experience Survey',
        'Performance Review Feedback',
        'Manager Effectiveness Survey',
        'Workplace Culture Assessment'
      ]
    },
    {
      id: 'education',
      name: 'Education',
      icon: MdSchool,
      color: '#28a745',
      description: 'Student satisfaction, course evaluation, and academic feedback',
      templates: [
        'Student Satisfaction Survey',
        'Faculty Feedback Survey',
        'Course Evaluation Survey',
        'Online Learning Experience Survey',
        'Parent Satisfaction Survey',
        'Alumni Engagement Survey',
        'Campus Facilities Survey',
        'Library Services Survey',
        'Student Support Services Survey',
        'Academic Program Assessment'
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: MdLocalHospital,
      color: '#dc3545',
      description: 'Patient satisfaction, medical services, and healthcare experience',
      templates: [
        'Patient Satisfaction Survey',
        'Doctor Service Feedback Survey',
        'Nurse Care Experience Survey',
        'Appointment Experience Survey',
        'Hospital Facility Survey',
        'Emergency Department Survey',
        'Discharge Process Survey',
        'Telemedicine Experience Survey',
        'Medical Insurance Survey',
        'Pharmacy Services Survey'
      ]
    },
    {
      id: 'hospitality',
      name: 'Hospitality & Tourism',
      icon: MdHotel,
      color: '#ffc107',
      description: 'Guest satisfaction, travel experience, and hospitality services',
      templates: [
        'Hotel Guest Satisfaction Survey',
        'Restaurant Experience Survey',
        'Travel & Tour Feedback Survey',
        'Event Experience Survey',
        'Conference Feedback Survey',
        'Destination Tourism Survey',
        'Flight Experience Survey',
        'Cruise Experience Survey',
        'Resort Amenities Survey',
        'Wedding Venue Survey'
      ]
    },
    {
      id: 'sports',
      name: 'Sports & Entertainment',
      icon: MdSports,
      color: '#17a2b8',
      description: 'Fan experience, events, and entertainment services',
      templates: [
        'Stadium Experience Survey',
        'Fan Satisfaction Survey',
        'Event Entry Experience Survey',
        'Concession Services Survey',
        'Ticket Purchase Experience Survey',
        'Season Ticket Holder Survey',
        'Sports Club Membership Survey',
        'Entertainment Venue Survey',
        'Concert Experience Survey',
        'Sports Broadcast Survey'
      ]
    },
    {
      id: 'banking',
      name: 'Banking & Financial',
      icon: MdAccountBalance,
      color: '#6f42c1',
      description: 'Customer satisfaction, banking services, and financial products',
      templates: [
        'Bank Branch Experience Survey',
        'Digital Banking Survey',
        'Loan Application Survey',
        'Customer Service Survey',
        'ATM Experience Survey',
        'Credit Card Satisfaction Survey',
        'Investment Services Survey',
        'Insurance Claim Survey',
        'Mortgage Experience Survey',
        'Financial Advisory Survey'
      ]
    },
    {
      id: 'retail',
      name: 'Retail & E-Commerce',
      icon: MdShoppingCart,
      color: '#fd7e14',
      description: 'Shopping experience, product feedback, and retail services',
      templates: [
        'In-Store Shopping Survey',
        'Online Shopping Survey',
        'Product Quality Survey',
        'Delivery Experience Survey',
        'Customer Service Survey',
        'Return/Exchange Survey',
        'Store Layout Survey',
        'Checkout Experience Survey',
        'Loyalty Program Survey',
        'Product Recommendation Survey'
      ]
    },
    {
      id: 'government',
      name: 'Government & Public',
      icon: MdLocationCity,
      color: '#20c997',
      description: 'Citizen services, government processes, and public feedback',
      templates: [
        'Citizen Service Survey',
        'Government Website Survey',
        'License Application Survey',
        'Public Transport Survey',
        'Municipal Services Survey',
        'E-Government Survey',
        'Public Safety Survey',
        'Community Development Survey',
        'Tax Services Survey',
        'Public Health Survey'
      ]
    },
    {
      id: 'construction',
      name: 'Construction & Real Estate',
      icon: MdConstruction,
      color: '#6c757d',
      description: 'Property satisfaction, construction feedback, and real estate services',
      templates: [
        'Home Buyer Survey',
        'Tenant Satisfaction Survey',
        'Construction Quality Survey',
        'Property Management Survey',
        'Real Estate Agent Survey',
        'Maintenance Services Survey',
        'Property Viewing Survey',
        'Neighborhood Survey',
        'Facility Management Survey',
        'Contractor Performance Survey'
      ]
    },
    {
      id: 'automotive',
      name: 'Automotive & Transport',
      icon: MdDirectionsCar,
      color: '#e83e8c',
      description: 'Vehicle services, transport experience, and automotive feedback',
      templates: [
        'Car Purchase Survey',
        'Vehicle Service Survey',
        'Car Rental Survey',
        'Public Transport Survey',
        'Parking Services Survey',
        'Driving Experience Survey',
        'Auto Insurance Survey',
        'Dealership Experience Survey',
        'Taxi/Ride Service Survey',
        'Traffic Management Survey'
      ]
    },
    {
      id: 'technology',
      name: 'Technology & Digital',
      icon: MdComputer,
      color: '#495057',
      description: 'Software feedback, IT services, and technology experience',
      templates: [
        'App Usability Survey',
        'Website Experience Survey',
        'IT Support Survey',
        'Software Feedback Survey',
        'Cybersecurity Survey',
        'Product Beta Testing Survey',
        'Technology Training Survey',
        'Digital Transformation Survey',
        'Cloud Services Survey',
        'Mobile App Survey'
      ]
    }
  ], []);



  // Initialize templates on mount
  useEffect(() => {
    const generateAndSetTemplates = () => {
      const generatedTemplates = [];
      let id = 1;
      
      categories.forEach(category => {
        category.templates.forEach(templateName => {
          generatedTemplates.push({
            id: id++,
            name: templateName,
            description: `Professional ${templateName.toLowerCase()} designed for ${category.name.toLowerCase()} sector. Get actionable insights and improve your organization.`,
            category: category.id,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color,
            questions: Math.floor(Math.random() * 15) + 8,
            estimatedTime: `${Math.floor(Math.random() * 6) + 5} min`,
            popular: Math.random() > 0.7,
            isNew: Math.random() > 0.8,
            isPremium: Math.random() > 0.6,
            rating: (4.2 + Math.random() * 0.8).toFixed(1),
            usageCount: Math.floor(Math.random() * 2000) + 100,
            language: Math.random() > 0.3 ? ['English', 'Arabic'] : ['English'],
            tags: [
              category.name.split(' ')[0].toLowerCase(),
              'feedback',
              'survey',
              templateName.split(' ')[0].toLowerCase()
            ]
          });
        });
      });
      
      return generatedTemplates;
    };
    
    const generatedTemplates = generateAndSetTemplates();
    setTemplates(generatedTemplates);
    setFilteredTemplates(generatedTemplates);
    setLoading(false);
    setPagination(prev => ({ ...prev, total: generatedTemplates.length }));
  }, [categories]);

  // Filter templates when search/category changes
  useEffect(() => {
    let filtered = templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
      const matchesLanguage = selectedLanguage === "all" || template.language.some(lang => 
        lang.toLowerCase() === selectedLanguage.toLowerCase()
      )
      return matchesSearch && matchesCategory && matchesLanguage
    });

    // Sort filtered results
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredTemplates(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, page: 1 }));
  }, [templates, searchTerm, selectedCategory, selectedLanguage, sortBy]);

  // Category options for filter dropdown
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
  ]

  // Handler Functions
  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleUseTemplate = async (template) => {
    console.log('=== SurveyTemplates: handleUseTemplate called ===');
    console.log('Template data:', template);
    
    try {
      console.log('Setting global loading to true');
      setGlobalLoading(true);
      
      // In production, this would create a new survey from the template
      console.log('Showing confirmation dialog');
      const result = await Swal.fire({
        title: 'Create Survey from Template',
        text: `Create a new survey using "${template.name}" template?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#007bff',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Create Survey',
        cancelButtonText: 'Cancel'
      });

      console.log('Dialog result:', result);
      
      if (result.isConfirmed) {
        console.log('User confirmed, navigating to survey builder with template data');
        console.log('Navigation state:', { template: template, from: 'templates' });
        
        // Navigate to create survey with template
        navigate('/surveys/create', { 
          state: { 
            template: template,
            from: 'templates' 
          } 
        });
        
        console.log('Navigation completed');
      } else {
        console.log('User cancelled template selection');
      }
    } catch (error) {
      console.error('=== SurveyTemplates: Error using template ===');
      console.error('Error details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create survey from template. Please try again.'
      });
    } finally {
      console.log('Setting global loading to false');
      setGlobalLoading(false);
      console.log('=== SurveyTemplates: handleUseTemplate completed ===');
    }
  };

  const handleCreateCustomTemplate = () => {
    navigate('/surveys/templates/create');
  };

  // Get statistics for display
  const getTemplateStats = () => {
    const totalTemplates = templates.length;
    const popularTemplates = templates.filter(t => t.popular).length;
    const newTemplates = templates.filter(t => t.isNew).length;
    const categoriesWithTemplates = categories.filter(cat => 
      templates.some(t => t.category === cat.id)
    ).length;

    return {
      total: totalTemplates,
      popular: popularTemplates,
      new: newTemplates,
      categories: categoriesWithTemplates
    };
  };

  const stats = getTemplateStats();

  // update total count when filteredTemplates changes
  // useEffect(() => {
  //   setPagination((prev) => ({ ...prev, total: filteredTemplates.length }))
  // }, [filteredTemplates])

  useEffect(() => {
    setPagination((prev) => {
      if (prev.total !== filteredTemplates.length) {
        return { ...prev, total: filteredTemplates.length }
      }
      return prev
    })
  }, [filteredTemplates])
  

  const getCategoryBadge = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return <Badge bg="secondary">Unknown</Badge>;
    
    return (
      <Badge 
        bg="light" 
        text="dark" 
        style={{ 
          backgroundColor: category.color + '20', 
          color: category.color,
          border: `1px solid ${category.color}40`
        }}
      >
        <category.icon className="me-1" size={12} />
        {category.name}
      </Badge>
    );
  }

  return (
    <div className="survey-templates-container">
      <Container fluid>
        {/* Header Section */}
        <div className="templates-header">
          <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
            <div className="header-content">
              <div className="d-flex align-items-center mb-2">
                <MdDescription className="me-2" style={{ color: 'var(--primary-color, #1fdae4)' }} size={28} />
                <h1 className="h4 mb-0 fw-bold">Survey Templates</h1>
              </div>
              <p className="text-muted mb-0 d-none d-sm-block">
                Choose from {stats.total} professional templates across {stats.categories} industries
              </p>
            </div>
            <Button 
              variant="outline-primary" 
              className="d-flex align-items-center create-template-btn"
              onClick={handleCreateCustomTemplate}
              size="sm"
            >
              <MdAdd className="me-1 me-sm-2" size={16} />
              <span className="d-none d-sm-inline">Create Custom</span>
              <span className="d-sm-none">Create</span>
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="stats-container d-flex gap-2 flex-wrap mb-3">
            <div className="stat-badge">
              <MdStar className="me-1" size={14} />
              <span>{stats.popular} Popular</span>
            </div>
            <div className="stat-badge">
              <span>{stats.new} New</span>
            </div>
            <div className="stat-badge">
              <MdCategory className="me-1" size={14} />
              <span>{stats.categories} Categories</span>
            </div>
            <div className="stat-badge d-none d-sm-flex">
              <span>{stats.total} Total</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-section">
          {/* Search Bar - Always Visible */}
          <div className="search-container mb-3">
            <InputGroup className="search-input-group">
              <InputGroup.Text>
                <MdSearch size={18} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {/* Mobile Filter Button */}
              <Button 
                variant="outline-secondary"
                className="d-lg-none filter-toggle-btn"
                onClick={() => setShowMobileFilters(true)}
              >
                <MdFilterList size={18} />
                <span className="ms-1">Filter</span>
              </Button>
            </InputGroup>
          </div>

          {/* Desktop Filters */}
          <div className="d-none d-lg-flex filters-row align-items-center gap-3">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <Form.Select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
                size="sm"
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Form.Select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Language</label>
              <Form.Select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="filter-select"
                size="sm"
              >
                <option value="all">All Languages</option>
                <option value="english">English</option>
                <option value="arabic">Arabic</option>
              </Form.Select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Sort by</label>
              <Form.Select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
                size="sm"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="alphabetical">A-Z</option>
              </Form.Select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all') && (
          <div className="results-summary d-flex align-items-center justify-content-between flex-wrap mb-3">
            <div className="results-info">
              <span className="results-count">{filteredTemplates.length}</span>
              <span className="text-muted ms-1"> of {templates.length} templates</span>
              {searchTerm && <span className="text-muted d-none d-sm-inline"> for "{searchTerm}"</span>}
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm"
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLanguage('all');
              }}
            >
              <span className="d-none d-sm-inline">Clear Filters</span>
              <span className="d-sm-none">Clear</span>
            </Button>
          </div>
        )}

        {/* Templates Grid */}
        <div className="templates-grid">
          {filteredTemplates
            .slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
            .map((template) => (
              <div key={template.id} className="template-card-wrapper">
                <div className="template-card">
                  {/* Template Header */}
                  <div className="template-header">
                    <div className="template-badges">
                      {getCategoryBadge(template.category)}
                      {template.popular && (
                        <div className="template-badge popular">
                          <MdStar size={12} />
                          <span>Popular</span>
                        </div>
                      )}
                      {template.isNew && (
                        <div className="template-badge new">
                          <span>New</span>
                        </div>
                      )}
                      {template.isPremium && (
                        <div className="template-badge premium">
                          <span>Premium</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Template Content */}
                  <div className="template-content">
                    <h5 className="template-title">{template.name}</h5>
                    <p className="template-description">{template.description}</p>
                  </div>

                  {/* Template Stats */}
                  <div className="template-stats">
                    <div className="stats-row">
                      <div className="stat-item">
                        <FaUsers size={12} />
                        <span>{template.usageCount > 1000 ? `${Math.round(template.usageCount/1000)}k` : template.usageCount}</span>
                      </div>
                      <div className="stat-item">
                        <FaClock size={12} />
                        <span>{template.estimatedTime}</span>
                      </div>
                      <div className="stat-item">
                        <MdDescription size={12} />
                        <span>{template.questions}Q</span>
                      </div>
                      <div className="stat-item">
                        <MdStar size={12} />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                    
                    {/* Language Support */}
                    <div className="template-languages">
                      <FaLanguage size={12} />
                      <span>{template.language.join(', ')}</span>
                    </div>
                  </div>

                  {/* Template Actions */}
                  <div className="template-actions">
                    <Button 
                      variant="primary" 
                      className="use-template-btn" 
                      onClick={() => handleUseTemplate(template)}
                    >
                      <MdAdd size={16} />
                      <span>Use Template</span>
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      className="preview-btn"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <MdVisibility size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {/* Pagination */}
        <div className="pagination-container">
          <Pagination
            current={pagination.page}
            total={filteredTemplates.length}
            limit={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            darkMode={darkMode}
          />
        </div>

        {/* Mobile Filters Drawer */}
        <Offcanvas
          show={showMobileFilters}
          onHide={() => setShowMobileFilters(false)}
          placement="end"
          className="mobile-filters-drawer"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <MdFilterList className="me-2" />
              Filter Templates
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="mobile-filters">
              <div className="filter-section">
                <label className="filter-label">Category</label>
                <Form.Select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select mb-3"
                >
                  {categoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Form.Select>
              </div>
              
              <div className="filter-section">
                <label className="filter-label">Language</label>
                <Form.Select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="filter-select mb-3"
                >
                  <option value="all">All Languages</option>
                  <option value="english">English</option>
                  <option value="arabic">Arabic</option>
                </Form.Select>
              </div>
              
              <div className="filter-section">
                <label className="filter-label">Sort by</label>
                <Form.Select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select mb-3"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="alphabetical">A-Z</option>
                </Form.Select>
              </div>
              
              <div className="filter-actions">
                <Button 
                  variant="outline-secondary"
                  className="w-100 mb-2"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedLanguage('all');
                  }}
                >
                  Clear All Filters
                </Button>
                <Button 
                  variant="primary"
                  className="w-100"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">
            <h5>Loading Templates...</h5>
            <p className="text-muted">Please wait while we fetch the latest templates</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredTemplates.length === 0 && (
        <Row>
          <Col>
            <div className="text-center py-5">
              <MdSearch size={64} className="text-muted mb-3" />
              <h5>No templates found</h5>
              <p className="text-muted mb-4">
                {searchTerm 
                  ? `No templates match "${searchTerm}". Try different keywords or browse all categories.`
                  : 'No templates available for the selected criteria. Try adjusting your filters.'
                }
              </p>
              <Button 
                variant="outline-primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLanguage('all');
                }}
              >
                <MdFilterList className="me-2" />
                Show All Templates
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Template Preview Modal */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <MdVisibility className="me-2" />
            Template Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTemplate && (
            <div>
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  {getCategoryBadge(selectedTemplate.category)}
                  <h4 className="ms-3 mb-0 temp">{selectedTemplate.name}</h4>
                </div>
                <p className="text-muted">{selectedTemplate.description}</p>
              </div>

              <Row className="mb-4">
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <MdDescription size={24} className="text-primary mb-2" />
                    <div className="fw-semibold temp">{selectedTemplate.questions}</div>
                    <small className="text-muted">Questions</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <FaClock size={20} className="text-success mb-2" />
                    <div className="fw-semibold temp">{selectedTemplate.estimatedTime}</div>
                    <small className="text-muted">Duration</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <MdStar size={24} className="text-warning mb-2" />
                    <div className="fw-semibold temp">{selectedTemplate.rating}/5.0</div>
                    <small className="text-muted">Rating</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <FaUsers size={20} className="text-info mb-2" />
                    <div className="fw-semibold temp">{selectedTemplate.usageCount.toLocaleString()}</div>
                    <small className="text-muted">Used</small>
                  </div>
                </Col>
              </Row>

              <div className="mb-4">
                <h6 className="mb-3 temp">Sample Questions Preview:</h6>
                <div className="bg-light p-3 rounded">
                  <div className="mb-3 temp">
                    <strong>1. Overall Satisfaction</strong>
                    <p className="mb-0 text-muted small">How would you rate your overall experience?</p>
                  </div>
                  <div className="mb-3 temp">
                    <strong>2. Service Quality</strong>
                    <p className="mb-0 text-muted small">How satisfied are you with the quality of service?</p>
                  </div>
                  <div className="mb-0 temp">
                    <strong>3. Recommendation</strong>
                    <p className="mb-0 text-muted small">How likely are you to recommend us to others?</p>
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">... and {selectedTemplate.questions - 3} more questions</small>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="mb-2 temp">Available Languages:</h6>
                <div className="d-flex gap-2">
                  {selectedTemplate.language.map((lang, index) => (
                    <Badge key={index} bg="secondary" className="d-flex align-items-center">
                      <FaLanguage className="me-1" size={12} />
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              setShowPreviewModal(false);
              handleUseTemplate(selectedTemplate);
            }}
          >
            <MdAdd className="me-2" />
            Use This Template
          </Button>
        </Modal.Footer>
      </Modal>

      </Container>
    </div>
  )
}

export default SurveyTemplates
