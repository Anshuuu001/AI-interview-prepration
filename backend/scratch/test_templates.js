const jwt = require('jsonwebtoken');
const axios = require('axios');

(async () => {
  try {
    const token = jwt.sign({ id: '1', role: 'student', sessionId: 'test-session' }, 'dev-secret-key', { expiresIn: '7d' });
    console.log('Generated token:', token);
    
    console.log('Sending request to /api/interview/templates...');
    const response = await axios.get('http://localhost:8080/api/interview/templates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Response data length:', response.data.length);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Server error:', err.response.status, err.response.data);
    } else {
      console.error('Network/other error:', err.message);
    }
    process.exit(1);
  }
})();
