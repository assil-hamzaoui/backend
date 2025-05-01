const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// JWT Secret Key (to store in .env file for security)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_token';

// --- Signup ---
const signup = (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email invalide" });
  }

  const emailCheckQuery = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
  db.query(emailCheckQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (results[0].count > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });

      const insertQuery = 'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [firstname, lastname, email, hashedPassword], (err) => {
        if (err) return res.status(500).json({ message: "Erreur d'inscription" });

        res.status(201).json({ message: "Utilisateur inscrit avec succès" });
      });
    });
  });
};

const login = (req, res) => {
    const { email, password } = req.body;
  
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      if (results.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
  
      const user = results[0];
  
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ message: "Erreur de vérification" });
        if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });
  
        const payload = {
          id: user.id,
          firstname: user.firstname,
          email: user.email,
        };
  
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
  
        // Admin check (for multiple admins)
        const adminUsers = [
          { email: 'insafjedai@gmail.com', password: 'insaf@' },
          { email: 'ferielmoumni@gmail.com', password: 'feriyel@' },
          { email: 'safaabidi@gmail.com', password: 'safa@' },
          { email: 'alibejaoui@gmail.com', password: 'ali@' }
          
        
        ];
  
        // Check if the logged-in user is one of the admins
        const admin = adminUsers.find(admin => admin.email === email && admin.password === password);
  
        if (admin) {
          return res.status(200).json({
            message: "Connexion réussie, vous êtes administrateur",
            token,
            redirectTo: '/admin/dashboard',
            user: {
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
            },
          });
        }
  
        // For regular users
        return res.status(200).json({
          message: "Connexion réussie",
          token,
          redirectTo: '/',
          user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
          },
        });
      });
    });
  };
// Envoi d'un email de réinitialisation (forgot password)
const forgotPassword = (req, res) => {
  const { email } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (results.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const user = results[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Log the token to debug
    console.log(`Token generated: ${token}`);
    console.log(`Lien de réinitialisation: http://localhost:4200/reset-password/${token}`);

    res.status(200).json({
      message: "Un lien de réinitialisation a été envoyé à votre adresse email",
      resetLink: `http://localhost:4200/reset-password/${token}`
    });
  });
};

// Réinitialiser le mot de passe avec le token
const resetPassword = (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log(`Received token: ${token}`);  // Log the received token

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err);  // Log any errors for debugging
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(sql, [hashedPassword, decoded.id], (err) => {
      if (err) return res.status(500).json({ message: "Erreur de réinitialisation du mot de passe" });

      res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
    });
  });
};
const handleFormSubmission = (req, res) => {
  const { prenom, nom, codePostal, telephone, specialite, email, objet } = req.body;

  // Vérifie si l'email existe déjà
  const checkSql = 'SELECT * FROM demandes WHERE email = ?';
  db.query(checkSql, [email], (checkErr, results) => {
    if (checkErr) return res.status(500).send(checkErr);

    if (results.length > 0) {
      return res.status(400).send({ success: false, message: 'Cet email existe déjà.' });
    }

    // Si l’email est unique, on insère
    const insertSql = `INSERT INTO demandes (prenom, nom, codePostal, telephone, specialite, email, objet)
                       VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(insertSql, [prenom, nom, codePostal, telephone, specialite, email, objet], (insertErr, result) => {
      if (insertErr) return res.status(500).send(insertErr);
      res.send({ success: true, id: result.insertId });
    });
  });
};



module.exports = {
  signup,
  login,
  resetPassword,
  forgotPassword,
  handleFormSubmission,

};
