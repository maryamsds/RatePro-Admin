import { Container, Row, Col, Card } from "react-bootstrap"

const AuthLayout = ({ title, subtitle, icon, children, footer }) => {
    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={10} md={8} lg={5} xl={4}>
                    <Card className="shadow-lg border-0">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <div
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3"
                                    style={{ width: "60px", height: "60px" }}
                                >
                                    {icon}
                                </div>
                                <h1 className="h3 text-primary fw-bold mb-2">{title}</h1>
                                {subtitle && <p className="text-muted">{subtitle}</p>}
                            </div>
                            {children}
                        </Card.Body>
                        {footer && <Card.Footer className="text-center py-3">{footer}</Card.Footer>}
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default AuthLayout
