import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap-icons/font/bootstrap-icons.css';
import circleLogo from '../../assets/logos/Capstone Temp Logo circle.png';
import longLogo from '../../assets/logos/Capstone Temp Logo Long.png';

export default function Top() {
  return (
    <Navbar
      className="fixed-top w-100 px-0" //fixed-top makes the navbar fixed to the top of the page
      style={{ backgroundColor: "#f8f9fa", minHeight: "60px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center px-3">
        {/* Logos on the left */}
        <div className="d-flex align-items-center">
          <img src={circleLogo} alt="Circle Logo" height={40} className="me-2" />
          <img src={longLogo} alt="Long Logo" height={40} />
        </div>
        {/* Search bar on the right */}
        <Form className="d-flex flex-grow-1 justify-content-center ms-3" style={{ maxWidth: 800 }}>
  <InputGroup 
    className="shadow-sm" 
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
    </Navbar>
  );
}