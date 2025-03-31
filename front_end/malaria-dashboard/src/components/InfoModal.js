// src/components/InfoModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function InfoModal({ show, handleClose, title, children }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Additional Information'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InfoModal;
