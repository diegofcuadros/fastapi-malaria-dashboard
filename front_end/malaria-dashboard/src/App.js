// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Form,
  Card,
  Tabs,
  Tab,
  Button,
  Modal,
} from 'react-bootstrap';
import TimeSeriesPlot from './components/TimeSeriesPlot';
import ForecastPlot from './components/ForecastPlot';
import SummaryStats from './components/SummaryStats';
import BoxPlot from './components/BoxPlot';
import ViolinPlot from './components/ViolinPlot';
import HeatmapPlot from './components/HeatmapPlot';
import './App.css';

// Home page component
function Home() {
  return (
    <Container className="mt-3">
      <h1>Welcome to the Malaria Dashboard</h1>
      <p>Please use the navigation bar above to access the Dashboard.</p>
    </Container>
  );
}

// Dashboard page component
function Dashboard() {
  // State for main filters
  const [column, setColumn] = useState('malinc');
  const [steps, setSteps] = useState(12);
  const [region, setRegion] = useState(''); // Empty means "All Regions"
  const [site, setSite] = useState('');     // Empty means "All Sites"
  const [showModal, setShowModal] = useState(false); // For modal pop-up

  return (
    <>
      <Container fluid className="main-container">
        <Row>
          {/* Sidebar with Controls */}
          <Col xs={12} md={3}>
            <Card className="mb-3 p-3">
              <Card.Body>
                <Card.Title className="custom-card-title">
                  Dashboard Controls
                </Card.Title>
                {/* Column Selector */}
                <Form.Group controlId="formColumnSelect">
                  <Form.Label>Column to Analyze</Form.Label>
                  <Form.Control
                    as="select"
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                  >
                    <option value="malinc">Malaria Incidence (malinc)</option>
                    <option value="propsuspected">
                      Proportion Suspected (propsuspected)
                    </option>
                    <option value="TPR">Total Positive Rate (TPR)</option>
                  </Form.Control>
                </Form.Group>
                {/* Forecast Steps */}
                <Form.Group controlId="formForecastSteps" className="mt-3">
                  <Form.Label>Months to Forecast</Form.Label>
                  <Form.Control
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                  />
                </Form.Group>
                {/* Region Filter */}
                <Form.Group controlId="formRegionSelect" className="mt-3">
                  <Form.Label>Select Region</Form.Label>
                  <Form.Control
                    as="select"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="">All Regions</option>
                    <option value="Central">Central</option>
                    <option value="Eastern">Eastern</option>
                    <option value="Northern">Northern</option>
                    <option value="Western">Western</option>
                    <option value="Kampala">Kampala</option>
                  </Form.Control>
                </Form.Group>
                {/* Site Filter */}
                <Form.Group controlId="formSiteSelect" className="mt-3">
                  <Form.Label>Select Site</Form.Label>
                  <Form.Control
                    as="select"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                  >
                    <option value="">All Sites</option>
                    <option value="Site001">Site 001</option>
                    <option value="Site002">Site 002</option>
                    {/* Add more site options as needed */}
                  </Form.Control>
                </Form.Group>
                {/* Button to Show Modal */}
                <Button variant="info" className="mt-3" onClick={() => setShowModal(true)}>
                  More Details
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content Area */}
          <Col xs={12} md={9}>
            <Tabs defaultActiveKey="forecast" id="dashboard-tabs" className="mb-3">
              <Tab eventKey="forecast" title="Forecast & Data">
                <Row>
                  <Col xs={12}>
                    <Card className="mb-3">
                      <Card.Body>
                        <Card.Title>Time Series Plot</Card.Title>
                        <TimeSeriesPlot column={column} region={region} site={site} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <Card.Title>Forecast Plot</Card.Title>
                        <ForecastPlot column={column} steps={steps} />
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <Card.Title>Summary Statistics</Card.Title>
                        <SummaryStats column={column} region={region} site={site} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="visuals" title="Advanced Visuals">
                <Row>
                  <Col xs={12} md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <Card.Title>Box Plot</Card.Title>
                        {/* BoxPlot component should fetch grouped data from /box_data */}
                        <BoxPlot column={column} />
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <Card.Title>Violin Plot</Card.Title>
                        {/* ViolinPlot component should fetch grouped data from /box_data or similar */}
                        <ViolinPlot column={column} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Card className="mb-3">
                      <Card.Body>
                        <Card.Title>Heatmap</Card.Title>
                        <HeatmapPlot column={column} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>

      {/* Modal for Additional Information */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Additional Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This section displays more detailed information about the dashboard or instructions on how to use it.
          </p>
          <p>
            You can customize this modal to include extra charts, tables, or links to documentation.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// Main App Component with Routing
function AppRouter() {
  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#" className="navbar-title">Malaria Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
