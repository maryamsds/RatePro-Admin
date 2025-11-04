# 🎫 Support Ticket System Documentation

## Overview
The RatePro Support Ticket System provides comprehensive ticket management functionality with full CRUD operations, file uploads, status management, and role-based permissions.

## 📁 System Architecture

### Backend Components
```
controllers/ticketController.js    # Main business logic
routes/ticketRoutes.js            # API endpoints
models/Ticket.js                  # Database schema
```

### Frontend Components
```
src/api/ticketApi.js              # API integration layer
src/pages/Support/                # UI components
  ├── CreateTicket.jsx            # Ticket creation form
  ├── SupportTickets.jsx          # Ticket listing & management
  └── TicketDetail.jsx            # Individual ticket view
src/hooks/useTickets.js           # Custom React hooks
```

## 🚀 API Endpoints

### Ticket Management
- `POST /tickets` - Create new ticket
- `GET /tickets` - List tickets with pagination/filtering
- `GET /tickets/:id` - Get specific ticket details
- `PUT /tickets/:id` - Update ticket information
- `PATCH /tickets/:id/status` - Update ticket status
- `DELETE /tickets/:id` - Delete ticket
- `GET /tickets/stats` - Get ticket statistics
- `PATCH /tickets/bulk` - Bulk update operations

### Query Parameters
```javascript
// GET /tickets
{
  page: 1,              // Page number
  limit: 10,            // Results per page
  status: 'open',       // Filter by status
  priority: 'high',     // Filter by priority
  category: 'technical',// Filter by category
  search: 'keyword',    // Search in subject/description
  sortBy: 'createdAt',  // Sort field
  sortOrder: 'desc'     // Sort direction
}
```

## 💾 Database Schema

### Ticket Model
```javascript
{
  subject: String,           // Required, max 200 chars
  description: String,       // Required, max 2000 chars
  status: String,           // open, in-progress, resolved, closed, pending
  priority: String,         // low, medium, high, critical
  category: String,         // technical, billing, general, feature-request
  contactEmail: String,     // Contact email for non-authenticated users
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: Date
  }],
  internalNotes: [{
    note: String,
    createdBy: ObjectId,
    createdAt: Date
  }],
  tags: [String],
  estimatedResolutionTime: Date,
  actualResolutionTime: Date,
  satisfactionRating: Number,
  createdBy: ObjectId,      // User who created ticket
  assignedTo: ObjectId,     // Assigned support agent
  tenant: ObjectId,         // Multi-tenant support
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Frontend API Integration

### Basic Usage
```javascript
import { 
  createTicket, 
  getTickets, 
  updateTicketStatus,
  deleteTicket 
} from '../api/ticketApi';

// Create a ticket
const newTicket = await createTicket({
  subject: "Dashboard Access Issue",
  description: "Cannot access the main dashboard",
  priority: "high",
  category: "technical"
}, [fileArray]);

// Get tickets with filtering
const tickets = await getTickets({
  page: 1,
  limit: 10,
  status: 'open'
});

// Update status
await updateTicketStatus(ticketId, 'resolved');

// Delete ticket
await deleteTicket(ticketId);
```

### Using Custom Hooks
```javascript
import { useTickets } from '../hooks/useTickets';

const TicketComponent = () => {
  const {
    tickets,
    loading,
    pagination,
    createNewTicket,
    updateStatus,
    removeTicket,
    updateFilters
  } = useTickets({ limit: 10, status: 'open' });

  const handleCreate = async (ticketData, files) => {
    try {
      await createNewTicket(ticketData, files);
      // Success handling is built into the hook
    } catch (error) {
      // Error handling is also built in
    }
  };

  return (
    <div>
      {loading ? <Spinner /> : (
        tickets.map(ticket => (
          <TicketCard 
            key={ticket._id} 
            ticket={ticket}
            onStatusUpdate={updateStatus}
            onDelete={removeTicket}
          />
        ))
      )}
    </div>
  );
};
```

## 📤 File Upload System

### Configuration
- **Storage**: Cloudinary integration
- **Max Files**: 2 per ticket
- **Max Size**: 5MB per file  
- **Allowed Types**: Images, PDFs, Documents
- **Temporary Storage**: Local uploads folder

### Frontend Implementation
```javascript
const handleFileUpload = async (files, ticketData) => {
  const formData = new FormData();
  files.forEach(file => formData.append('attachments', file));
  
  const response = await createTicket(ticketData, files);
  return response.data;
};
```

## 🔐 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (admin, support, user)
- Tenant isolation for multi-tenant environments
- Permission-based actions (create, view, edit, delete)

### Input Validation
- Server-side validation using Joi schemas
- File type and size validation
- XSS protection for text inputs
- SQL injection prevention

### Security Middleware
```javascript
// Authentication required for all routes
router.use(authenticate);

// Role-based permissions
router.post('/tickets', authorize(['admin', 'support', 'user']));
router.delete('/tickets/:id', authorize(['admin', 'support']));
```

## 📊 Status Management

### Available Statuses
- **Open**: Newly created, awaiting response
- **In Progress**: Being actively worked on
- **Pending**: Waiting for customer response
- **Resolved**: Issue fixed, awaiting confirmation
- **Closed**: Completed and confirmed

### Status Transitions
```javascript
const statusFlow = {
  'open': ['in-progress', 'pending', 'closed'],
  'in-progress': ['open', 'pending', 'resolved', 'closed'],
  'pending': ['in-progress', 'resolved', 'closed'],
  'resolved': ['closed', 'open'],
  'closed': ['open'] // Can reopen if needed
};
```

## 🎯 Priority Levels

### Priority System
- **Low**: Non-urgent issues
- **Medium**: Standard issues
- **High**: Important issues affecting workflow
- **Critical**: System-down scenarios requiring immediate attention

### Priority Badges
```javascript
const getPriorityBadge = (priority) => {
  const priorityMap = {
    'low': 'success',
    'medium': 'warning', 
    'high': 'danger',
    'critical': 'dark'
  };
  return <Badge bg={priorityMap[priority]}>{priority}</Badge>;
};
```

## 📈 Analytics & Reporting

### Available Statistics
```javascript
// GET /tickets/stats response
{
  total: 150,
  byStatus: {
    open: 25,
    'in-progress': 10,
    resolved: 100,
    closed: 15
  },
  byPriority: {
    low: 50,
    medium: 60,
    high: 30,
    critical: 10
  },
  byCategory: {
    technical: 80,
    billing: 30,
    general: 25,
    'feature-request': 15
  },
  avgResolutionTime: 2.5, // days
  satisfactionScore: 4.2   // out of 5
}
```

## 🎨 UI Components

### Component Features

#### CreateTicket.jsx
- Responsive form with validation
- File upload with drag & drop
- Real-time form validation
- Success/error notifications
- Bootstrap 5.3 styling

#### SupportTickets.jsx  
- Paginated ticket listing
- Advanced filtering options
- Bulk actions support
- Status update functionality
- Search and sorting

#### TicketDetail.jsx
- Complete ticket information display
- Comment system
- Status management buttons
- File attachment viewing
- Activity timeline
- Contact information panel

## 🚨 Error Handling

### API Error Responses
```javascript
// Standardized error format
{
  success: false,
  message: "Error description",
  errors: [
    {
      field: "subject",
      message: "Subject is required"
    }
  ],
  code: "VALIDATION_ERROR"
}
```

### Frontend Error Handling
```javascript
try {
  await createTicket(ticketData);
} catch (error) {
  if (error.response?.status === 400) {
    // Validation errors
    showValidationErrors(error.response.data.errors);
  } else if (error.response?.status === 401) {
    // Authentication error
    redirectToLogin();
  } else {
    // General error
    showErrorNotification(error.message);
  }
}
```

## 🧪 Testing

### Test Coverage Areas
- API endpoint functionality
- Form validation
- File upload process
- Status transitions
- Permission checks
- Error scenarios

### Example Test Cases
```javascript
describe('Ticket API', () => {
  test('should create ticket with valid data', async () => {
    const ticketData = {
      subject: 'Test Ticket',
      description: 'Test Description',
      priority: 'medium',
      category: 'technical'
    };
    
    const response = await createTicket(ticketData);
    expect(response.data.success).toBe(true);
    expect(response.data.data.subject).toBe(ticketData.subject);
  });
  
  test('should reject invalid priority', async () => {
    const ticketData = {
      subject: 'Test Ticket',
      description: 'Test Description', 
      priority: 'invalid',
      category: 'technical'
    };
    
    await expect(createTicket(ticketData)).rejects.toThrow();
  });
});
```

## 🔧 Configuration

### Environment Variables
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Upload Settings
MAX_FILE_SIZE=5242880  # 5MB in bytes
MAX_FILES_PER_TICKET=2
ALLOWED_FILE_TYPES=image,pdf,doc,docx,txt

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend Configuration
```javascript
// src/config/api.js
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  UPLOAD_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  UPLOAD_MAX_FILES: 2,
  TIMEOUT: 30000, // 30 seconds
};
```

## 📱 Mobile Responsiveness

### Responsive Design Features
- Mobile-first approach
- Touch-friendly buttons and forms
- Collapsible navigation
- Optimized file upload for mobile
- Responsive tables and cards
- Swipe gestures for actions

### Breakpoint Considerations
```scss
// Mobile First
.ticket-card {
  // Base mobile styles
  
  @media (min-width: 768px) {
    // Tablet styles
  }
  
  @media (min-width: 1200px) {
    // Desktop styles
  }
}
```

## 🎨 Theming Integration

### CSS Custom Properties
```css
:root {
  --primary-color: #1fdae4;
  --light-card: #ffffff;
  --light-bg: #f8f9fa;
  --light-border: #dee2e6;
  --light-text: #495057;
  --border-radius: 8px;
}
```

### Theme Application
- Consistent color scheme across all components
- Dark mode support preparation
- Accessibility-compliant color contrasts
- Customizable theme variables

## 🚀 Deployment

### Build Process
```bash
# Backend
npm install
npm run build
npm start

# Frontend  
npm install
npm run build
npm run preview
```

### Production Considerations
- Environment variable configuration
- Database indexing optimization
- File upload storage configuration
- Error logging and monitoring
- Performance optimization
- Security headers configuration

## 📚 Additional Resources

### Documentation Links
- [Backend API Documentation](./API_DOCS.md)
- [Frontend Component Guide](./COMPONENT_GUIDE.md)
- [Database Schema Reference](./SCHEMA_DOCS.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Support
- Create GitHub issues for bugs
- Use discussions for feature requests
- Check existing documentation before asking questions
- Follow coding standards and contribution guidelines

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: RatePro Development Team