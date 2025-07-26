import React from "react";
import { Modal, ListGroup } from "react-bootstrap";

export default function CategoriesModal({ show, onHide, categories, onSelect, selectedCategory, categoryIcons }) {
  return (
    <Modal show={show} onHide={onHide} centered animation={true}>
      <Modal.Body style={{ borderRadius: 16, padding: 24, background: "#fff" }}>
        <h5 className="mb-3" style={{ fontWeight: 700 }}>Select a Category</h5>
        <ListGroup>
          {categories.map(cat => (
            <ListGroup.Item
              key={cat.category_id}
              action
              active={selectedCategory === cat.category_name}
              onClick={() => { onSelect(cat.category_name); onHide(); }}
              className="d-flex align-items-center"
              style={{ marginBottom: 0, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            >
              <i className={`bi ${categoryIcons[cat.category_name] || 'bi-tag'} me-2`} style={{ color: '#e53935', fontSize: 18 }}></i>
              {cat.category_name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
} 