const db = require('../config/db');

// Récupérer tous les utilisateurs
exports.getAllUsers = (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.status(200).json(results);
  });
};

// Supprimer un utilisateur
exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  });
};

// Ajouter un utilisateur
exports.createUser = (req, res) => {
  const { firstname, lastname, email } = req.body;
  const sql = 'INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)';
  db.query(sql, [firstname, lastname, email], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de l\'ajout' });
    res.status(201).json({ message: 'Utilisateur ajouté avec succès' });
  });
};

// Modifier un utilisateur
exports.updateUser = (req, res) => {
  const { firstname, lastname, email } = req.body;
  const userId = req.params.id;
  const sql = 'UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE id = ?';
  db.query(sql, [firstname, lastname, email, userId], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
  });
};
