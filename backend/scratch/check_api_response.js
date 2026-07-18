const jwt = require('jsonwebtoken');
const axios = require('axios');

(async () => {
  try {
    const token = jwt.sign({ 
      id: 'user-1784362411215', 
      role: 'student', 
      sessionId: 'ffgonrwjrd' 
    }, 'dev-secret-key', { expiresIn: '7d' });
    
    console.log('Sending request to /api/interview/templates...');
    const response = await axios.get('http://localhost:8080/api/interview/templates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Response data length:', response.data.length);
    console.log('Response data sample IDs:', response.data.map(d => d.id));
  } catch (err) {
    if (err.response) {
      console.error('Server error:', err.response.status, err.response.data);
    } else {
      console.error('Network/other error:', err.message);
    }
    process.exit(1);
  }
})();
