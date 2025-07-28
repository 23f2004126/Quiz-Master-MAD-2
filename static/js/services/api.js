export const apiService = {
  async request(endpoint, method = 'GET', data = null) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    const config = { method: method, headers: headers };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`/api${endpoint}`, config);
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'An unknown API error occurred.');
      }
      return responseData;
    } catch (error) {
      console.error('API Service Error:', error.message);
      throw error;
    }
  },
  get(endpoint) { return this.request(endpoint, 'GET'); },
  post(endpoint, data) { return this.request(endpoint, 'POST', data); },
  put(endpoint, data) { return this.request(endpoint, 'PUT', data); },
  delete(endpoint) { return this.request(endpoint, 'DELETE'); },
};