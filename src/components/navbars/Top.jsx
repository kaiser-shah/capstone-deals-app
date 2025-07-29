import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap-icons/font/bootstrap-icons.css';
import circleLogo from '../../assets/logos/Capstone-Temp-Logo-circle.png';
import longLogo from '../../assets/logos/Capstone-Temp-Logo-Long.png';
import { useNavigate } from "react-router-dom";

export default function Top() {
  const navigate = useNavigate();
  return (
    <Navbar
      className="px-0"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100vw",
        backgroundColor: "#f8f9fa",
        minHeight: "60px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        zIndex: 2000,
        overflow: "hidden"
      }}
    >
      <div className="container-fluid d-flex align-items-center px-3 position-relative flex-nowrap" style={{ minHeight: 45 }}>
        {/* Logos on the left */}
        <div className="d-flex align-items-center flex-shrink-0" style={{ zIndex: 2, cursor: 'pointer' }} onClick={() => navigate("/") }>
          <img src={circleLogo} alt="Circle Logo" height={40} className="me-2" />
          <img src={longLogo} alt="Long Logo" height={40} />
        </div>
        {/* Centered search bar, but never overlaps logos on >=375px */}
        <div
          className="flex-grow-1 ms-3"
          style={{
            maxWidth: 500,
            minWidth: 0,
            zIndex: 1,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Form className="d-flex justify-content-center w-100">
            <InputGroup
              className="shadow-sm w-100"
              style={{
                backgroundColor: "#fff",
                borderRadius: "25px",
                overflow: "hidden"
              }}
            >
              <InputGroup.Text className="bg-white border-0">
                <i className="bi bi-search" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search brands, products etc."
                className="border-0 small-placeholder"
                style={{ backgroundColor: "#fff" }}
              />
            </InputGroup>
          </Form>
        </div>
        <style>{`
          @media (max-width: 374px) {
            .navbar .container-fluid { flex-wrap: nowrap !important; }
            .navbar .container-fluid > div { min-width: 0 !important; }
            .navbar .container-fluid > div.flex-grow-1 { position: absolute !important; left: 0; right: 0; top: 50%; transform: translateY(-50%); }
          }
          .small-placeholder::placeholder {
            color: #b0b0b0 !important;
            font-style: italic !important;
            opacity: 1 !important;
          }
        `}</style>
      </div>
    </Navbar>
  );
}