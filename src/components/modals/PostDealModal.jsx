import React, { useState, useEffect } from "react";
import { Modal, Button, Form, FloatingLabel } from "react-bootstrap";
import { getAuth } from "firebase/auth";

const BACKEND_URL = "https://capstone-deals-app-endpoints.vercel.app";

export default function PostDealModal({ show, onClose, onDealPosted, initialData = {}, isEdit = false }) {
  const [form, setForm] = useState({
    deal_url: "",
    title: "",
    description: "",
    price: "",
    original_price: "",
    images: [],
    category_name: ""
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState([]); // For edit mode

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${BACKEND_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.map(c => c.category_name));
        }
      } catch {}
    }
    if (show) fetchCategories();
  }, [show]);

  // Pre-populate form fields in edit mode
  useEffect(() => {
    if (!show) return;
    if (isEdit && initialData) {
      setForm({
        deal_url: initialData.deal_url || "",
        title: initialData.title || "",
        description: initialData.description || "",
        price: initialData.price || "",
        original_price: initialData.original_price || "",
        images: [], // Only for new uploads
        category_name: initialData.category_name || ""
      });
      setExistingImages(initialData.images || []);
    } else if (!isEdit) {
      setForm({
        deal_url: "",
        title: "",
        description: "",
        price: "",
        original_price: "",
        images: [],
        category_name: ""
      });
      setExistingImages([]);
    }
  }, [show, isEdit, initialData?.deal_id]);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm(f => ({ ...f, images: Array.from(files).slice(0, 5) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  // Remove an existing image (edit mode)
  function handleRemoveExistingImage(image_id) {
    setExistingImages(imgs => imgs.filter(img => img.image_id !== image_id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();

      let deal = initialData;
      if (isEdit) {
        // Edit mode: update deal
        const res = await fetch(`${BACKEND_URL}/deals/${initialData.deal_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            deal_url: form.deal_url,
            title: form.title,
            description: form.description,
            price: form.price,
            original_price: form.original_price,
            category_name: form.category_name
          })
        });
        if (!res.ok) throw new Error("Failed to update deal");
        deal = await res.json();

        // Remove images that were deleted by the user
        const removedImages = (initialData.images || []).filter(img => !existingImages.some(ei => ei.image_id === img.image_id));
        for (const img of removedImages) {
          await fetch(`${BACKEND_URL}/deals/${initialData.deal_id}/images/${img.image_id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        // Upload new images if any
        if (form.images.length > 0) {
          const fd = new FormData();
          form.images.forEach(img => fd.append("images", img));
          const imgRes = await fetch(`${BACKEND_URL}/deals/${initialData.deal_id}/images/multiple`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          });
          if (!imgRes.ok) throw new Error("Failed to upload images");
        }
      } else {
        // Create mode (original logic)
        const res = await fetch(`${BACKEND_URL}/deals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            deal_url: form.deal_url,
            title: form.title,
            description: form.description,
            price: form.price,
            original_price: form.original_price,
            category_name: form.category_name
          })
        });
        if (!res.ok) throw new Error("Failed to create deal");
        deal = await res.json();

        // Upload images if any
        if (form.images.length > 0) {
          const fd = new FormData();
          form.images.forEach(img => fd.append("images", img));
          const imgRes = await fetch(`${BACKEND_URL}/deals/${deal.deal_id}/images/multiple`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          });
          if (!imgRes.ok) throw new Error("Failed to upload images");
        }
      }

      onDealPosted && onDealPosted(deal);
      setForm({
        deal_url: "",
        title: "",
        description: "",
        price: "",
        original_price: "",
        images: [],
        category_name: ""
      });
      setExistingImages([]);
      onClose();
      window.location.reload()
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered animation={true} dialogClassName="post-deal-modal" contentClassName="border-0" style={{ zIndex: 2100,   }}>
      <Modal.Body style={{ borderRadius: "8px", padding: 32, background: "#fff", minHeight: 400, border: "1px solid red" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span style={{ fontWeight: 700, fontSize: 22 }}>{isEdit ? 'Edit Deal' : 'Submit a new deal'}</span>
          <i className="bi bi-x-lg" style={{ fontSize: 24, cursor: "pointer" }} onClick={onClose}></i>
        </div>
        <Form onSubmit={handleSubmit}>
          <FloatingLabel controlId="dealUrl" label="Deal URL*" className="mb-3" style={{ fontSize: 13 }}>
            <Form.Control name="deal_url" value={form.deal_url} onChange={handleChange} required />
          </FloatingLabel>
          <FloatingLabel controlId="title" label="Title*" className="mb-3" style={{ fontSize: 13 }}>
            <Form.Control name="title" value={form.title} onChange={handleChange} required />
          </FloatingLabel>
          <FloatingLabel controlId="description" label="Description" className="mb-3" style={{ fontSize: 13 }}>
            <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} style={{ minHeight: 60 }} />
          </FloatingLabel>
          <FloatingLabel controlId="category" label="Category*" className="mb-3" style={{ fontSize: 13 }}>
            <Form.Select name="category_name" value={form.category_name} onChange={handleChange} required>
              <option value="" disabled></option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </FloatingLabel>
          <FloatingLabel controlId="price" label="Price*" className="mb-3" style={{ fontSize: 13 }}>
            <Form.Control name="price" value={form.price} onChange={handleChange} required />
          </FloatingLabel>
          <FloatingLabel controlId="originalPrice" label="Original Price" className="mb-3" style={{ fontSize: 13 }}>
            <Form.Control name="original_price" value={form.original_price} onChange={handleChange} />
          </FloatingLabel>
          {/* Existing images (edit mode) */}
          {isEdit && existingImages.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 13 }}>Current Images</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {existingImages.map(img => (
                  <div key={img.image_id} style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={img.image_url} alt="Deal" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                    <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" style={{ borderRadius: '50%', padding: 2, fontSize: 12, lineHeight: 1, width: 22, height: 22 }} onClick={() => handleRemoveExistingImage(img.image_id)} title="Remove image">
                      <i className="bi bi-x" />
                    </button>
                  </div>
                ))}
              </div>
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: 13 }}>Add Images (up to 5)</Form.Label>
            <Form.Control type="file" name="images" multiple accept="image/*" onChange={handleChange} />
          </Form.Group>
          {error && <div className="text-danger mb-2">{error}</div>}
          <Button type="submit" className="w-100 rounded-pill fw-bold" style={{ background: '#e53935', border: 'none', fontSize: 18, marginBottom: 12 }} disabled={loading}>
            Submit
          </Button>
        </Form>
      </Modal.Body>
      <style>{`
        .post-deal-modal .modal-dialog {
          position: fixed;
          bottom: 0;
          margin: 0 auto;
          left: 0;
          right: 0;
          width: 100vw;
          max-width: 420px;
          border-radius: 24px 24px 0 0;
        }
      `}</style>
    </Modal>
  );
} 