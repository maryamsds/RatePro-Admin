import { Container, Row, Col, Card } from "react-bootstrap"

const AuthLayout = ({ title, subtitle, icon, children, footer }) => {
    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-3 sm:py-4 px-3 sm:px-4">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={10} md={8} lg={5} xl={4}>
                    <Card className="shadow-lg border-0 rounded-3">
                        <Card.Body className="p-3 sm:p-4 md:p-5">
                            <div className="text-center mb-3 sm:mb-4">
                                <div
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3"
                                    style={{ width: "50px", height: "50px" }}
                                >
                                    <div className="text-2xl sm:text-3xl">
                                        {icon}
                                    </div>
                                </div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl text-primary fw-bold mb-2">{title}</h1>
                                {subtitle && <p className="text-muted text-sm sm:text-base mb-0">{subtitle}</p>}
                            </div>
                            <div className="auth-form-content">
                                {children}
                            </div>
                        </Card.Body>
                        {footer && <Card.Footer className="text-center py-3 text-sm sm:text-base">{footer}</Card.Footer>}
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default AuthLayout
