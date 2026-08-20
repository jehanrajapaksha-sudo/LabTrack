import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api, { getApiError, openReportFile } from '../api/client';

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const backTo = user?.role === 'admin' ? '/admin' : '/lab';

  useEffect(() => {
    api
      .get(`/reports/${id}`)
      .then((res) => setReport(res.data.report))
      .catch((err) => setError(getApiError(err, 'Could not load report.')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFile = async (download) => {
    setFileError('');
    try {
      await openReportFile(id, download);
    } catch (err) {
      setFileError(getApiError(err, 'Could not open the file.'));
    }
  };

  const markReviewed = async () => {
    setUpdating(true);
    setError('');
    try {
      const res = await api.patch(`/reports/${id}/review`);
      setReport(res.data.report);
    } catch (err) {
      setError(getApiError(err, 'Could not update report.'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <Link to={backTo} className="back-link">
          Back to dashboard
        </Link>
        <h1>Report details</h1>

        {loading && <p className="muted">Loading...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {report && (
          <section className="card detail-card">
            <div className="detail-header">
              <div>
                <h2>{report.report_type}</h2>
                <p className="muted">Submitted {formatDate(report.submitted_at)}</p>
              </div>
              <span className={`badge badge-${report.status}`}>{report.status}</span>
            </div>

            <dl className="detail-grid">
              <div>
                <dt>Lab</dt>
                <dd>{report.lab_name || 'Your lab'}</dd>
              </div>
              <div>
                <dt>Patient name</dt>
                <dd>{report.patient_name}</dd>
              </div>
              <div>
                <dt>Patient ID</dt>
                <dd>{report.patient_id}</dd>
              </div>
              <div>
                <dt>Attachment</dt>
                <dd>{report.has_file ? 'Yes' : 'None'}</dd>
              </div>
            </dl>

            <h3>Details</h3>
            <p className="report-body">{report.report_details}</p>

            {fileError && <div className="alert alert-error">{fileError}</div>}

            <div className="actions">
              {report.has_file && (
                <>
                  <button type="button" className="btn btn-primary" onClick={() => handleFile(false)}>
                    View file
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => handleFile(true)}>
                    Download file
                  </button>
                </>
              )}
              {user?.role === 'admin' && report.status === 'pending' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={markReviewed}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Mark as reviewed'}
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
