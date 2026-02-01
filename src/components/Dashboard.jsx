import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { FaChartBar, FaChartPie, FaTable, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [pendingNormalEntries, setPendingNormalEntries] = useState([]);
  const [pendingConstructionEntries, setPendingConstructionEntries] = useState([]);
  const [approvedNormalEntries, setApprovedNormalEntries] = useState([]);
  const [approvedConstructionEntries, setApprovedConstructionEntries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(''); // added succes message raslen

  const [totalWaste, setTotalWaste] = useState(0);
  const [landfillWaste, setLandfillWaste] = useState(0);
  const [divertedWaste, setDivertedWaste] = useState(0);

  // fazet l edit !!!
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [editType, setEditType] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editData, setEditData] = useState({
    waste_subtype: '',
    quantity: '',
    date: '',
    location_id: '',
    waste_category: '',
    controlled_facility: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        const locationsRes = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/locations.php');
        if (!locationsRes.ok) throw new Error('Failed to fetch locations');
        const locationsData = await locationsRes.json();
        if (!Array.isArray(locationsData)) throw new Error('Invalid response format for locations');
        setLocations(locationsData);
  
        const pendingNormalRes = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php?category=normal&status=pending');
        if (!pendingNormalRes.ok) throw new Error(`Failed to fetch pending normal entries: ${pendingNormalRes.statusText}`);
        const pendingNormalData = await pendingNormalRes.json();
        if (!Array.isArray(pendingNormalData)) throw new Error('Invalid response format for pending normal entries');
        setPendingNormalEntries(pendingNormalData);
  
        const pendingConstructionRes = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php?category=construction&status=pending');
        if (!pendingConstructionRes.ok) throw new Error(`Failed to fetch pending construction entries: ${pendingConstructionRes.statusText}`);
        const pendingConstructionData = await pendingConstructionRes.json();
        if (!Array.isArray(pendingConstructionData)) throw new Error('Invalid response format for pending construction entries');
        setPendingConstructionEntries(pendingConstructionData);
  
        const approvedNormalRes = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php?category=normal&status=approved');
        if (!approvedNormalRes.ok) throw new Error(`Failed to fetch approved normal entries: ${approvedNormalRes.statusText}`);
        const approvedNormalData = await approvedNormalRes.json();
        if (!Array.isArray(approvedNormalData)) throw new Error('Invalid response format for approved normal entries');
        setApprovedNormalEntries(approvedNormalData);
  
        const approvedConstructionRes = await fetch('http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php?category=construction&status=approved');
        if (!approvedConstructionRes.ok) throw new Error(`Failed to fetch approved construction entries: ${approvedConstructionRes.statusText}`);
        const approvedConstructionData = await approvedConstructionRes.json();
        if (!Array.isArray(approvedConstructionData)) throw new Error('Invalid response format for approved construction entries');
        setApprovedConstructionEntries(approvedConstructionData);
  
        const allEntries = [...pendingNormalData, ...pendingConstructionData, ...approvedNormalData, ...approvedConstructionData];
        console.log('All Entries:', allEntries); // Log all entries
        console.log(
          'Controlled Facility Breakdown:',
          allEntries.reduce((acc, entry) => {
            const value = entry.controlled_facility;
            acc[value] = (acc[value] || 0) + 1;
            return acc;
          }, {})
        ); // Log distribution of controlled_facility
        const total = allEntries.reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
        const landfill = allEntries
          .filter((entry) => {
            const isLandfill = Number(entry.controlled_facility) === 0;
            console.log(`Entry ${entry.waste_entry_id}: controlled_facility=${entry.controlled_facility}, Is Landfill=${isLandfill}`);
            return isLandfill;
          })
          .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
        const diverted = allEntries
          .filter((entry) => Number(entry.controlled_facility) === 1)
          .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
  
        console.log('Calculated: Total Waste=', total, 'Landfill Waste=', landfill, 'Diverted Waste=', diverted);
        setTotalWaste(total);
        setLandfillWaste(landfill);
        setDivertedWaste(diverted);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getLocationName = (locationId) => {
    const location = locations.find((loc) => Number(loc.location_id) === Number(locationId));
    return location ? location.location_name : 'Unknown';
  };

  const handleEdit = (type, entry, status) => {
    setCurrentEntry({ ...entry });
    setEditType(type);
    setEditStatus(status);
    setEditData({
      waste_subtype: entry.waste_subtype || '',
      quantity: entry.quantity || '',
      date: entry.date || '',
      location_id: entry.location_id || '',
      waste_category: entry.waste_category || '',
      controlled_facility: entry.controlled_facility === 1, // badel 0 wla 1 3al base de donne changmeent pc 
    });
    setShowEditModal(true);
  };
// button l edit 
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
//button sublit l formulaire
  const handleEditSubmit = async () => {
    try {
      console.log('Sending PUT request with:', {
        waste_entry_id: currentEntry.waste_entry_id,
        quantity: editData.quantity,
        date: editData.date,
        waste_subtype: editData.waste_subtype,
        waste_category: editData.waste_category,
        controlled_facility: editData.controlled_facility ? 1 : 0,
        location_id: editData.location_id,
      });
      const response = await fetch(`http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php?id=${currentEntry.waste_entry_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waste_entry_id: currentEntry.waste_entry_id,
          quantity: editData.quantity,
          date: editData.date,
          waste_subtype: editData.waste_subtype,
          waste_category: editData.waste_category,
          controlled_facility: editData.controlled_facility ? 1 : 0,
          location_id: editData.location_id,
        }),
      });
      const text = await response.text(); // Log raw response
      console.log('Response:', text);
      const data = JSON.parse(text); // Parse response if valid JSON
      if (response.ok) {
        const updatedEntry = { ...currentEntry, ...editData, controlled_facility: editData.controlled_facility ? 1 : 0 };
        if (editType === 'normal') {
          if (editStatus === 'pending') {
            setPendingNormalEntries(
              pendingNormalEntries.map((entry) =>
                entry.waste_entry_id === updatedEntry.waste_entry_id ? updatedEntry : entry
              )
            );
          } else {
            setApprovedNormalEntries(
              approvedNormalEntries.map((entry) =>
                entry.waste_entry_id === updatedEntry.waste_entry_id ? updatedEntry : entry
              )
            );
          }
        } else {
          if (editStatus === 'pending') {
            setPendingConstructionEntries(
              pendingConstructionEntries.map((entry) =>
                entry.waste_entry_id === updatedEntry.waste_entry_id ? updatedEntry : entry
              )
            );
          } else {
            setApprovedConstructionEntries(
              approvedConstructionEntries.map((entry) =>
                entry.waste_entry_id === updatedEntry.waste_entry_id ? updatedEntry : entry
              )
            );
          }
        }
        // calcul
        const allEntries = [
          ...pendingNormalEntries.map((entry) =>
            entry.waste_entry_id === updatedEntry.waste_entry_id ? updatedEntry : entry
          ),
          ...pendingConstructionEntries.map((entry) =>
            entry.waste_entry_id === updatedEntry.waste_entry_id ? updatedEntry : entry
          ),
          ...approvedNormalEntries.map((entry) =>
            entry.waste_entry_id === updatedEntry.waste_entry_id ? updatedEntry : entry
          ),
          ...approvedConstructionEntries.map((entry) =>
            entry.waste_entry_id === updatedEntry.waste_entry_id ? updatedEntry : entry
          ),
        ];
        const total = allEntries.reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
        const landfill = allEntries
          .filter((entry) => Number(entry.controlled_facility) === 0)
          .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
        const diverted = allEntries
          .filter((entry) => Number(entry.controlled_facility) === 1)
          .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);

        setTotalWaste(total);
        setLandfillWaste(landfill);
        setDivertedWaste(diverted);
        setSuccess('Waste entry updated successfully!'); // edit mrigla message
        setShowEditModal(false);
      } else {
        setError(data.error || 'Failed to update entry');
      }
    } catch (err) {
      setError('An error occurred while updating: ' + err.message);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      const response = await fetch(`http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Approved',
          validator_id: user.user_id,
        }),
      });

      if (!response.ok) {
        setError('Failed to approve entry');
        return;
      }

      let entry;
      if (type === 'normal') {
        entry = pendingNormalEntries.find((e) => e.waste_entry_id === id);
        if (!entry) {
          setError('Entry not found in pending normal entries');
          return;
        }
        setPendingNormalEntries(pendingNormalEntries.filter((e) => e.waste_entry_id !== id));
        setApprovedNormalEntries([...approvedNormalEntries, { ...entry, status: 'Approved' }]);
      } else {
        entry = pendingConstructionEntries.find((e) => e.waste_entry_id === id);
        if (!entry) {
          setError('Entry not found in pending construction entries');
          return;
        }
        setPendingConstructionEntries(pendingConstructionEntries.filter((e) => e.waste_entry_id !== id));
        setApprovedConstructionEntries([...approvedConstructionEntries, { ...entry, status: 'Approved' }]);
      }

      const updatedEntry = { ...entry, status: 'Approved' };
      const allEntries = [
        ...pendingNormalEntries.filter((e) => e.waste_entry_id !== id),
        ...pendingConstructionEntries.filter((e) => e.waste_entry_id !== id),
        ...approvedNormalEntries,
        ...approvedConstructionEntries,
        updatedEntry,
      ];
      const total = allEntries.reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
      const landfill = allEntries
        .filter((entry) => Number(entry.controlled_facility) === 0)
        .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
      const diverted = allEntries
        .filter((entry) => Number(entry.controlled_facility) === 1)
        .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);

      setTotalWaste(total);
      setLandfillWaste(landfill);
      setDivertedWaste(diverted);
      setSuccess('Entry approved successfully!'); // aprove sar mrigl jawna bh
    } catch (err) {
      console.error('Error in handleApprove:', err);
      setError('An error occurred: ' + err.message);
    }
  };

  const handleReject = async (type, id) => {
    try {
      const response = await fetch(`http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Rejected',
          validator_id: user.user_id,
        }),
      });
      if (response.ok) {
        if (type === 'normal') {
          setPendingNormalEntries(pendingNormalEntries.filter((entry) => entry.waste_entry_id !== id));
        } else {
          setPendingConstructionEntries(pendingConstructionEntries.filter((entry) => entry.waste_entry_id !== id));
        }
        const allEntries = [
          ...pendingNormalEntries.filter((e) => e.waste_entry_id !== id),
          ...pendingConstructionEntries.filter((e) => e.waste_entry_id !== id),
          ...approvedNormalEntries,
          ...approvedConstructionEntries,
        ];
        const total = allEntries.reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
        const landfill = allEntries
          .filter((entry) => Number(entry.controlled_facility) === 0)
          .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
        const diverted = allEntries
          .filter((entry) => Number(entry.controlled_facility) === 1)
          .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);

        setTotalWaste(total);
        setLandfillWaste(landfill);
        setDivertedWaste(diverted);
        setSuccess('Entry rejected successfully!');
      } else {
        setError('Failed to reject entry');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleDelete = async (type, id, status) => {
    try {
      const response = await fetch(`http://localhost/municipality-sdg-tracker/municipality-sdg-tracker/src/api/waste_entries.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        if (type === 'normal') {
          if (status === 'pending') {
            setPendingNormalEntries(pendingNormalEntries.filter((entry) => entry.waste_entry_id !== id));
          } else {
            setApprovedNormalEntries(approvedNormalEntries.filter((entry) => entry.waste_entry_id !== id));
          }
        } else {
          if (status === 'pending') {
            setPendingConstructionEntries(pendingConstructionEntries.filter((entry) => entry.waste_entry_id !== id));
          } else {
            setApprovedConstructionEntries(approvedConstructionEntries.filter((entry) => entry.waste_entry_id !== id));
          }
        }
        const allEntries = [
          ...pendingNormalEntries.filter((e) => e.waste_entry_id !== id),
          ...pendingConstructionEntries.filter((e) => e.waste_entry_id !== id),
          ...approvedNormalEntries.filter((e) => e.waste_entry_id !== id),
          ...approvedConstructionEntries.filter((e) => e.waste_entry_id !== id),
        ];
        const total = allEntries.reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
        const landfill = allEntries
          .filter((entry) => Number(entry.controlled_facility) === 0)
          .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);
        const diverted = allEntries
          .filter((entry) => Number(entry.controlled_facility) === 1)
          .reduce((sum, entry) => sum + parseFloat(entry.quantity || 0), 0);

        setTotalWaste(total);
        setLandfillWaste(landfill);
        setDivertedWaste(diverted);
        setSuccess('Entry deleted successfully!'); // delete sar jawna bh
      } else {
        setError('Failed to delete entry');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const allEntries = [
    ...pendingNormalEntries.map((entry) => ({ ...entry, type: 'normal', status: 'pending' })),
    ...pendingConstructionEntries.map((entry) => ({ ...entry, type: 'construction', status: 'pending' })),
    ...approvedNormalEntries.map((entry) => ({ ...entry, type: 'normal', status: 'approved' })),
    ...approvedConstructionEntries.map((entry) => ({ ...entry, type: 'construction', status: 'approved' })),
  ];

  const processNormalWasteData = () => {
    const summary = [...pendingNormalEntries, ...approvedNormalEntries].reduce((acc, curr) => {
      acc[curr.waste_subtype] = (acc[curr.waste_subtype] || 0) + parseFloat(curr.quantity || 0);
      return acc;
    }, {});
    return Object.entries(summary).map(([type, quantity]) => ({
      name: type,
      quantity,
    }));
  };

  const processConstructionWasteData = () => {
    const summary = [...pendingConstructionEntries, ...approvedConstructionEntries].reduce((acc, curr) => {
      acc[curr.waste_subtype] = (acc[curr.waste_subtype] || 0) + parseFloat(curr.quantity || 0);
      return acc;
    }, {});
    return Object.entries(summary).map(([type, quantity]) => ({
      name: type,
      quantity,
    }));
  };

  const groupDataByMonth = (data) => {
    const grouped = data.reduce((acc, curr) => {
      const monthYear = curr.date.slice(0, 7);
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += parseFloat(curr.quantity || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([month, quantity]) => ({
      month,
      quantity,
    }));
  };

  const mergeMonthlyData = (normalData, constructionData) => {
    const allMonths = [...new Set([...normalData.map((d) => d.month), ...constructionData.map((d) => d.month)])].sort();
    return allMonths.map((month) => {
      const normal = normalData.find((d) => d.month === month)?.quantity || 0;
      const construction = constructionData.find((d) => d.month === month)?.quantity || 0;
      return {
        month,
        normal,
        construction,
      };
    });
  };

  const prepareNormalWasteSummary = () => {
    const wasteTypes = [...new Set([...pendingNormalEntries, ...approvedNormalEntries].map((item) => item.waste_subtype))];
    return wasteTypes.map((type) => {
      const entries = [...pendingNormalEntries, ...approvedNormalEntries].filter((item) => item.waste_subtype === type);
      let totalHousehold = 0;
      let totalNonHousehold = 0;
      let totalQuantity = 0;

      entries.forEach((entry) => {
        const quantity = parseFloat(entry.quantity) || 0;
        const household = entry.waste_category === 'household' ? quantity : 0;
        const nonHousehold = entry.waste_category === 'non_household' ? quantity : 0;

        totalQuantity += quantity;
        totalHousehold += household;
        totalNonHousehold += nonHousehold;
      });

      return {
        wasteType: type,
        household: totalHousehold,
        nonHousehold: totalNonHousehold,
        total: totalQuantity,
      };
    }).filter((item) => item.total > 0);
  };

  const prepareConstructionWasteSummary = () => {
    const wasteTypes = [...new Set([...pendingConstructionEntries, ...approvedConstructionEntries].map((item) => item.waste_subtype))];
    return wasteTypes.map((type) => {
      const total = [...pendingConstructionEntries, ...approvedConstructionEntries]
        .filter((item) => item.waste_subtype === type)
        .reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);

      return {
        wasteType: type,
        total,
      };
    }).filter((item) => item.total > 0);
  };

  const prepareWasteLocationData = () => {
    const allWasteData = [...pendingNormalEntries, ...pendingConstructionEntries, ...approvedNormalEntries, ...approvedConstructionEntries];
    const totalWaste = allWasteData.reduce((acc, curr) => acc + parseFloat(curr.quantity || 0), 0);

    const locationSummary = allWasteData.reduce((acc, curr) => {
      const locationName = getLocationName(curr.location_id);
      acc[locationName] = (acc[locationName] || 0) + parseFloat(curr.quantity || 0);
      return acc;
    }, {});

    return Object.entries(locationSummary).map(([location, quantity]) => ({
      location,
      quantity,
      percentage: ((quantity / totalWaste) * 100).toFixed(2) + '%',
    }));
  };

  const calculateSDG1161 = () => {
    const total = totalWaste;
    const controlled = divertedWaste;
    return total > 0 ? ((controlled / total) * 100).toFixed(2) : '0.00';
  };

  const landfillPercentage = totalWaste > 0 ? ((landfillWaste / totalWaste) * 100).toFixed(2) : '0.00';

  const normalWasteChartData = processNormalWasteData();
  const constructionWasteChartData = processConstructionWasteData();
  const normalWasteByMonth = groupDataByMonth([...pendingNormalEntries, ...approvedNormalEntries]);
  const constructionWasteByMonth = groupDataByMonth([...pendingConstructionEntries, ...approvedConstructionEntries]);
  const mergedMonthlyData = mergeMonthlyData(normalWasteByMonth, constructionWasteByMonth);
  const normalWasteSummary = prepareNormalWasteSummary();
  const constructionWasteSummary = prepareConstructionWasteSummary();
  const wasteLocationData = prepareWasteLocationData();

  if (user.role !== 'municipality_head') {
    return <Navigate to="/forms" />;
  }

  if (loading) {
    return (
      <Container className="my-5">
        <h2 className="text-center mb-4">
          <FaChartBar className="me-2" />
          Dashboard
        </h2>
        <p className="text-center">Loading...</p>
      </Container>
    );
  }

  if (allEntries.length === 0) {
    return (
      <Container className="my-5">
        <h2 className="text-center mb-4">
          <FaChartBar className="me-2" />
          Dashboard
        </h2>
        <p className="text-center">No data available  Please submit waste data to view the dashboard.</p>
      </Container>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Container className="my-5">
        <h2 className="text-center mb-4">
          <FaChartBar className="me-2" />
          Dashboard
        </h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>} {/* Display success message on dashboard */}

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-lg">
              <Card.Body>
                <h4 className="mb-4"><FaTable /> All Waste Entries</h4>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Waste Subtype</th>
                      <th>Quantity (kg)</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Controlled Facility</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEntries.map((entry) => (
                      <tr key={`${entry.type}-${entry.waste_entry_id}`}>
                        <td>{entry.type === 'normal' ? 'Normal Waste' : 'Construction Waste'}</td>
                        <td>{entry.waste_subtype || 'N/A'}</td>
                        <td>{entry.quantity || '0'}</td>
                        <td>{getLocationName(entry.location_id)}</td>
                        <td>{entry.date}</td>
                        <td>{entry.controlled_facility ? 'Yes' : 'No'}</td>
                        <td>{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</td>
                        <td>
                          {entry.status === 'pending' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprove(entry.type, entry.waste_entry_id)}
                                className="me-2"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleReject(entry.type, entry.waste_entry_id)}
                                className="me-2"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEdit(entry.type, entry, entry.status)}
                            className="me-2"
                          >
                            <FaEdit /> Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(entry.type, entry.waste_entry_id, entry.status)}
                          >
                            <FaTrash /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mt-4">
          <Col md={6}>
            <Card className="shadow-lg h-100">
              <Card.Body>
                <h4 className="mb-4"><FaChartBar /> Normal Waste Distribution</h4>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={normalWasteChartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-lg h-100">
              <Card.Body>
                <h4 className="mb-4"><FaChartPie /> Construction Waste Distribution</h4>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={constructionWasteChartData}
                        dataKey="quantity"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        label
                      >
                        {constructionWasteChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-lg">
              <Card.Body>
                <h4 className="mb-4"><FaChartBar /> Monthly Waste Comparison</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mergedMonthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="normal" fill="#0088FE" name="Normal Waste" />
                    <Bar dataKey="construction" fill="#00C49F" name="Construction Waste" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-lg">
              <Card.Body>
                <h4 className="mb-4"><FaChartBar /> Waste Trend Over Time</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mergedMonthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="normal" stroke="#0088FE" name="Normal Waste" />
                    <Line type="monotone" dataKey="construction" stroke="#00C49F" name="Construction Waste" />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-lg">
              <Card.Body>
                <h4 className="mb-4"><FaMapMarkerAlt /> Waste Location Distribution</h4>
                <Table striped bordered hover responsive style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Location</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Quantity (kg)</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteLocationData.map((row, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '12px', textAlign: 'left' }}>{row.location}</td>
                        <td style={{ padding: '12px', textAlign: 'left' }}>{row.quantity}</td>
                        <td style={{ padding: '12px', textAlign: 'left' }}>{row.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-lg">
              <Card.Body>
                <h4 className="mb-4"><FaTable /> Normal Waste Summary</h4>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Waste Type</th>
                      <th>Household Waste (kg)</th>
                      <th>Non-Household Waste (kg)</th>
                      <th>Total Waste (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalWasteSummary.map((row, index) => (
                      <tr key={index}>
                        <td>{row.wasteType}</td>
                        <td>{row.household.toFixed(2)}</td>
                        <td>{row.nonHousehold.toFixed(2)}</td>
                        <td>{row.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-lg">
              <Card.Body>
                <h4 className="mb-4"><FaTable /> Construction Waste Summary</h4>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Waste Type</th>
                      <th>Total Waste (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constructionWasteSummary.map((row, index) => (
                      <tr key={index}>
                        <td>{row.wasteType}</td>
                        <td>{row.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-lg">
              <Card.Body>
                <h4 className="mb-4">SDG 11.6.1 Progress</h4>
                <p>
                  <strong>Proportion of Waste Managed in Controlled Facilities:</strong> {calculateSDG1161()}%
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card className="shadow-lg">
              <Card.Body>
                <h4 className="mb-4">Landfill Waste Percentage</h4>
                <p>
                  <strong>Proportion of Waste Ending in Landfill:</strong> {calculateSDG1161()}%
                </p>
                <p className="text-muted">
                  <small>Waste managed in controlled facilities is considered diverted from landfill based on law.</small>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {currentEntry && (
          <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setSuccess(''); }}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Waste Entry</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Waste Subtype</Form.Label>
                  <Form.Select
                    name="waste_subtype"
                    value={editData.waste_subtype}
                    onChange={handleEditChange}
                    required
                  >
                    {editType === 'normal' ? (
                      <>
                        <option value="">Select Waste Type</option>
                        <option value="Textiles">Textiles</option>
                        <option value="Glass">Glass</option>
                        <option value="Plastic">Plastic</option>
                        <option value="Paper">Paper</option>
                        <option value="Organic">Organic</option>
                        <option value="Metal">Metal</option>
                      </>
                    ) : (
                      <>
                        <option value="">Select Waste Type</option>
                        <option value="Wood">Wood</option>
                        <option value="Construction">Construction</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={editData.quantity}
                    onChange={handleEditChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Select
                    name="location_id"
                    value={editData.location_id}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.location_id} value={loc.location_id}>
                        {loc.location_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={editData.date}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
                {editType === 'normal' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Waste Category</Form.Label>
                      <Form.Select
                        name="waste_category"
                        value={editData.waste_category}
                        onChange={handleEditChange}
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
                        name="controlled_facility"
                        checked={editData.controlled_facility}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => { setShowEditModal(false); setSuccess(''); }}>
                Close
              </Button>
              <Button variant="primary" onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    </ErrorBoundary>
  );
}