import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getApiError } from '../api/client';

const REPORT_TYPES = [
  'Blood Test',
  'Urine Test',
  'X-Ray',
  'MRI',
  'CT Scan',
  'Pathology',
  'Other'
];

const emptyForm = {
  patient_name: '',
  patient_id: '',
  report_type: '',
  report_details: '',
  file: null
};

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function LabDashboard() {
  const [form, setForm] = useState(emptyForm);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReports = async () => {
    const res = await api.get('/reports');
    setReports(res.data.reports);
  };

  useEffect(() => {
    loadReports()
      .catch((err) => setError(getApiError(err, 'Could not load reports.')))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.patient_name.trim() || !form.patient_id.trim() || !form.report_type || !form.report_details.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const data = new FormData();
    data.append('patient_name', form.patient_name.trim());
    data.append('patient_id', form.patient_id.trim());
    data.append('report_type', form.report_type);
    data.append('report_details', form.report_details.trim());
    if (form.file) {
      data.append('file', form.file);
    }

    setSubmitting(true);
    try {
      await api.post('/reports', data);
      setForm(emptyForm);
      e.target.reset();
      setSuccess('Report submitted.');
      await loadReports();
    } catch (err) {
      setError(getApiError(err, 'Could not submit report.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <h1>Lab dashboard</h1>
        <p className="muted">Submit a new report and review the ones you have already sent.</p>

        <section className="card">
          <h2>New lab report</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Patient name *
              <input
                type="text"
                name="patient_name"
                value={form.patient_name}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Patient ID *
              <input
                type="text"
                name="patient_id"
                value={form.patient_id}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Report type *
              <select name="report_type" value={form.report_type} onChange={onChange} required>
                <option value="">Select type</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Attachment (PDF or image)
              <input
                type="file"
                name="file"
                accept=".pdf,image/jpeg,image/png,image/gif,image/webp"
                onChange={onChange}
              />
            </label>
            <label className="full">
              Report details *
              <textarea
                name="report_details"
                rows="5"
                value={form.report_details}
                onChange={onChange}
                required
              />
            </label>
            <div className="full">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>My submitted reports</h2>
          {loading ? (
            <p className="muted">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="muted">No reports yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.patient_name}</td>
                      <td>{report.report_type}</td>
                      <td>
                        <span className={`badge badge-${report.status}`}>{report.status}</span>
                      </td>
                      <td>{formatDate(report.submitted_at)}</td>
                      <td>
                        <Link to={`/reports/${report.id}`}>View</Link>
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
