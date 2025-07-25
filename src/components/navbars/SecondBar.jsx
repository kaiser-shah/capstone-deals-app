import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState } from 'react';

const tabs = [
  { label: 'Hottest', icon: 'bi-fire' },
  { label: 'Trending', icon: 'bi-graph-up-arrow' },
  { label: 'All', icon: 'bi-circle' },
  { label: 'Categories', icon: 'bi-grid' },
];

export default function SecondBar({ selectedTab, onTabSelect, onCategoriesClick }) {
  const [activeIdx, setActiveIdx] = useState(null);

  function handleTabClick(idx) {
    setActiveIdx(idx);
    onTabSelect && onTabSelect(idx);
    if (tabs[idx].label === 'Categories' && onCategoriesClick) {
      onCategoriesClick();
    }
    setTimeout(() => setActiveIdx(null), 150);
  }

  return (
    <Navbar
      className="w-100 px-0 position-fixed top-0 start-0"
      style={{
        backgroundColor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        minHeight: '60px',
        marginTop: '60px', // offset for fixed Top navbar
        borderRadius: 0,
        zIndex: 1028, // just below Top
        left: 0,
        right: 0,
        width: '100%',
        paddingLeft: 0,
        paddingRight: 0
      }}
    >
      <Nav className="d-flex align-items-center gap-4 ps-3">
        {tabs.map((tab, idx) => (
          <Nav.Link
            key={tab.label}
            href="#"
            onClick={e => { e.preventDefault(); handleTabClick(idx); }}
            className={`d-flex align-items-center text-dark fw-medium p-0 position-relative`}
            style={{
              fontSize: '11px',
              background: activeIdx === idx ? '#eee' : 'none',
              border: 'none',
              borderRadius: 8,
              fontWeight: 500
            }}
          >
            <i className={`bi ${tab.icon} me-2`} style={{ color: '#888', fontSize: '1.3rem' }}></i>
            {tab.label}
            {selectedTab === idx && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: -6,
                  height: 3,
                  background: '#e53935',
                  borderRadius: 2,
                  content: '""',
                  display: 'block',
                  width: '100%'
                }}
              />
            )}
          </Nav.Link>
        ))}
      </Nav>
    </Navbar>
  );
}