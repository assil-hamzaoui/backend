const db = require('../config/db');

exports.getProfile = (req, res) => {
  const userId = req.user.id; // Get user id from decoded token
  
  const query = 'SELECT id, firstname, lastname, email FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]); // Return user profile data
  });
};

// Logout (just a client-side token deletion)
exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
