// src\pages\NotFound\NotFound.jsx

import { Container, Row, Col, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { MdHome } from "react-icons/md"

const NotFound = () => {
  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row>
        <Col xs={12} className="text-center">
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="text-muted mb-4">The page you are looking for doesn't exist or has been moved.</p>
          <Button as={Link} to="/app" variant="primary">
            <MdHome className="me-2" />
            Go Home
          </Button>
        </Col>
      </Row>
    </Container>
  )
}

export default NotFound
