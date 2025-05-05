import { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Card, Tabs, Tab } from 'react-bootstrap';
import { GiRecycle } from 'react-icons/gi';

export default function Forms({ user }) {
  const [normalWasteData, setNormalWasteData] = useState({
    waste_type_id: 1,
    waste_subtype: '',
    quantity: '',
    location_id: '',
    location_name: '',
    date: '',
    waste_category: 'household',
    controlled_facility: false,
  });
  const [constructionWasteData, setConstructionWasteData] = useState({
    waste_type_id: 2,
    waste_subtype: '',
    quantity: '',
    location_id: '',
    location_name: '',
    date: '',
    waste_category: 'construction',
    controlled_facility: false, // zid control facility ya raseln !!!!!!!!!!!!!
  });
  const [locations, setLocations] = useState([]);
  const [activeTab, setActiveTab] = useState('normal');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const normalWasteSubtypes = ['Textiles', 'Glass', 'Plastic', 'Paper', 'Organic', 'Metal'];
  const constructionWasteSubtypes = ['Wood', 'Construction'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locationsRes = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/locations.php');
        const response = await locationsRes.json();
        if (Array.isArray(response)) {
          setLocations(response);
        } else {
          setError('Failed to load locations: Invalid response');
        }
      } catch (err) {
        setError('Failed to load locations');
      }
    };
    fetchData();
  }, []);

  const handleNormalWasteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          waste_type_id: normalWasteData.waste_type_id,
          location_id: normalWasteData.location_id,
          location_name: normalWasteData.location_name,
          quantity: normalWasteData.quantity,
          date: normalWasteData.date,
          waste_category: normalWasteData.waste_category,
          household_waste: normalWasteData.waste_category === 'household' ? normalWasteData.quantity : null,
          non_household_waste: normalWasteData.waste_category === 'non_household' ? normalWasteData.quantity : null,
          controlled_facility: normalWasteData.controlled_facility ? 1 : 0, // Convert boolean to 1/0 for backend
          waste_subtype: normalWasteData.waste_subtype,
        }),
      });
      if (response.ok) {
        setSuccess('Normal waste entry submitted successfully');
        setNormalWasteData({
          waste_type_id: 1,
          waste_subtype: '',
          quantity: '',
          location_id: '',
          location_name: '',
          date: '',
          waste_category: 'household',
          controlled_facility: false,
        });
        const locationsRes = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/locations.php');
        const response = await locationsRes.json();
        if (Array.isArray(response)) {
          setLocations(response);
        }
      } else {
        setError('Failed to submit normal waste entry');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleConstructionWasteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          waste_type_id: constructionWasteData.waste_type_id,
          location_id: constructionWasteData.location_id,
          location_name: constructionWasteData.location_name,
          quantity: constructionWasteData.quantity,
          date: constructionWasteData.date,
          waste_category: constructionWasteData.waste_category,
          controlled_facility: constructionWasteData.controlled_facility ? 1 : 0, // Convert boolean to 1/0 for backend
          waste_subtype: constructionWasteData.waste_subtype,
        }),
      });
      if (response.ok) {
        setSuccess('Construction waste entry submitted successfully');
        setConstructionWasteData({
          waste_type_id: 2,
          waste_subtype: '',
          quantity: '',
          location_id: '',
          location_name: '',
          date: '',
          waste_category: 'construction',
          controlled_facility: false,
        });
        const locationsRes = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/locations.php');
        const response = await locationsRes.json();
        if (Array.isArray(response)) {
          setLocations(response);
        }
      } else {
        setError('Failed to submit construction waste entry');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <Container className="my-5">
      <Card className="shadow-lg">
        <Card.Body>
          <h2 className="text-center mb-4">
            <GiRecycle className="me-2" />
            Waste Management Tracking
          </h2>
          <Alert variant="info">
            Welcome, {user.role === 'municipality_head' ? 'Municipality Head' : 'Worker'}!
          </Alert>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            <Tab eventKey="normal" title="Normal Waste">
              <Form onSubmit={handleNormalWasteSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Waste Type</Form.Label>
                  <Form.Select
                    value={normalWasteData.waste_subtype}
                    onChange={(e) => setNormalWasteData({ ...normalWasteData, waste_subtype: e.target.value })}
                    required
                  >
                    <option value="">Select Waste Type</option>
                    {normalWasteSubtypes.map((subtype) => (
                      <option key={subtype} value={subtype}>
                        {subtype}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    value={normalWasteData.quantity}
                    onChange={(e) => setNormalWasteData({ ...normalWasteData, quantity: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    value={normalWasteData.location_id}
                    onChange={(e) => setNormalWasteData({ ...normalWasteData, location_id: e.target.value, location_name: '' })}
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.location_id} value={loc.location_id}>
                        {loc.location_name}
                      </option>
                    ))}
                    <option value="new">Add New Location</option>
                  </Form.Select>
                </Form.Group>
                {normalWasteData.location_id === 'new' && (
                  <Form.Group className="mb-3">
                    <Form.Label>New Location Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={normalWasteData.location_name}
                      onChange={(e) => setNormalWasteData({ ...normalWasteData, location_name: e.target.value })}
                      required
                    />
                  </Form.Group>
                )}
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={normalWasteData.date}
                    onChange={(e) => setNormalWasteData({ ...normalWasteData, date: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Waste Category</Form.Label>
                  <Form.Select
                    value={normalWasteData.waste_category}
                    onChange={(e) => setNormalWasteData({ ...normalWasteData, waste_category: e.target.value })}
                    required
                  >
                    <option value="household">Household</option>
                    <option value="non_household">Non-Household</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Controlled Facility"
                    checked={normalWasteData.controlled_facility}
                    onChange={(e) => setNormalWasteData({ ...normalWasteData, controlled_facility: e.target.checked })}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit Normal Waste
                </Button>
              </Form>
            </Tab>
            <Tab eventKey="construction" title="Construction and Wood Waste">
              <Form onSubmit={handleConstructionWasteSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Waste Type</Form.Label>
                  <Form.Select
                    value={constructionWasteData.waste_subtype}
                    onChange={(e) => setConstructionWasteData({ ...constructionWasteData, waste_subtype: e.target.value })}
                    required
                  >
                    <option value="">Select Waste Type</option>
                    {constructionWasteSubtypes.map((subtype) => (
                      <option key={subtype} value={subtype}>
                        {subtype}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    value={constructionWasteData.quantity}
                    onChange={(e) => setConstructionWasteData({ ...constructionWasteData, quantity: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    value={constructionWasteData.location_id}
                    onChange={(e) => setConstructionWasteData({ ...constructionWasteData, location_id: e.target.value, location_name: '' })}
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.location_id} value={loc.location_id}>
                        {loc.location_name}
                      </option>
                    ))}
                    <option value="new">Add New Location</option>
                  </Form.Select>
                </Form.Group>
                {constructionWasteData.location_id === 'new' && (
                  <Form.Group className="mb-3">
                    <Form.Label>New Location Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={constructionWasteData.location_name}
                      onChange={(e) => setConstructionWasteData({ ...constructionWasteData, location_name: e.target.value })}
                      required
                    />
                  </Form.Group>
                )}
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={constructionWasteData.date}
                    onChange={(e) => setConstructionWasteData({ ...constructionWasteData, date: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Controlled Facility"
                    checked={constructionWasteData.controlled_facility}
                    onChange={(e) => setConstructionWasteData({ ...constructionWasteData, controlled_facility: e.target.checked })}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit Construction and Wood Waste
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}