import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getApiError } from '../api/client';

function formatDate(value) {
  return new Date(value).toLocaleString();
}

const emptyFilters = { labName: '', status: '', date: '' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(emptyFilters);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadReports = async (nextFilters = filters) => {
    const params = {};
    if (nextFilters.labName.trim()) params.labName = nextFilters.labName.trim();
    if (nextFilters.status) params.status = nextFilters.status;
    if (nextFilters.date) params.date = nextFilters.date;
    const res = await api.get('/reports', { params });
    setReports(res.data.reports);
  };

  useEffect(() => {
    loadReports()
      .catch((err) => setError(getApiError(err, 'Could not load reports.')))
      .finally(() => setLoading(false));
  }, []);

  const onFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loadReports();
    } catch (err) {
      setError(getApiError(err, 'Could not filter reports.'));
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilters(emptyFilters);
    setError('');
    setLoading(true);
    try {
      await loadReports(emptyFilters);
    } catch (err) {
      setError(getApiError(err, 'Could not load reports.'));
    } finally {
      setLoading(false);
    }
  };

  const markReviewed = async (event, id) => {
    event.stopPropagation();
    setUpdatingId(id);
    setError('');
    try {
      await api.patch(`/reports/${id}/review`);
      await loadReports();
    } catch (err) {
      setError(getApiError(err, 'Could not update report.'));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <h1>Admin dashboard</h1>
        <p className="muted">All lab reports. Filter by lab name, status, or submitted date.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="card filters" onSubmit={applyFilters}>
          <label>
            Lab name
            <input
              type="text"
              name="labName"
              value={filters.labName}
              onChange={onFilterChange}
              placeholder="Search lab"
            />
          </label>
          <label>
            Status
            <select name="status" value={filters.status} onChange={onFilterChange}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </label>
          <label>
            Date
            <input type="date" name="date" value={filters.date} onChange={onFilterChange} />
          </label>
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Filter
            </button>
            <button type="button" className="btn btn-ghost" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </form>

        <section className="card">
          {loading ? (
            <p className="muted">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="muted">No reports match these filters.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Lab</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="clickable"
                      onClick={() => navigate(`/reports/${report.id}`)}
                    >
                      <td>{report.lab_name}</td>
                      <td>{report.patient_name}</td>
                      <td>{report.report_type}</td>
                      <td>
                        <span className={`badge badge-${report.status}`}>{report.status}</span>
                      </td>
                      <td>{formatDate(report.submitted_at)}</td>
                      <td>
                        {report.status === 'pending' ? (
                          <button
                            type="button"
                            className="btn btn-small"
                            disabled={updatingId === report.id}
                            onClick={(event) => markReviewed(event, report.id)}
                          >
                            {updatingId === report.id ? 'Saving...' : 'Mark reviewed'}
                          </button>
                        ) : (
                          <Link to={`/reports/${report.id}`} onClick={(e) => e.stopPropagation()}>
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
