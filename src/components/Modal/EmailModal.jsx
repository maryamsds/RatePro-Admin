// src/components/modals/EmailModal.jsx

import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const EmailModal = ({
    show,
    onClose,
    onSend,
    subject,
    setSubject,
    message,
    setMessage,
    recipientEmail,
    sending, // <-- new
  }) => {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Send Email</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="emailSubject">
                        <Form.Label>Email Subject</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="emailBody">
                        <Form.Label>Email Message</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder="Write your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onSend} disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                </Button>

            </Modal.Footer>
        </Modal>
    );
};

export default EmailModal;
