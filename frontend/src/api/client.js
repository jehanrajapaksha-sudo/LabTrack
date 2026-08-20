import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getApiError(error, fallback = 'Something went wrong.') {
  return error.response?.data?.message || fallback;
}

export async function openReportFile(reportId, download = false) {
  try {
    const response = await api.get(`/reports/${reportId}/file`, {
      responseType: 'blob',
      params: download ? { download: 'true' } : {}
    });

    const contentType = response.headers['content-type'] || response.data.type;
    const blob = new Blob([response.data], { type: contentType });
    const url = URL.createObjectURL(blob);

    if (download) {
      const link = document.createElement('a');
      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      link.href = url;
      link.download = match ? match[1] : `report-${reportId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      try {
        const parsed = JSON.parse(await error.response.data.text());
        const wrapped = new Error(parsed.message || 'Could not open the file.');
        wrapped.response = { data: parsed, status: error.response.status };
        throw wrapped;
      } catch (parseError) {
        if (parseError.response) throw parseError;
      }
    }
    throw error;
  }
}

export default api;
