const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors

const app = express();
const PORT = 3002;

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'dev_user',
  password: 'WimHoff2024!!',
  database: 'cards_db'
});

db.connect(err => {
  if (err) {
    console.log('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Enable CORS for all origins (you can specify allowed origins)
app.use(cors());

// Middleware to parse JSON
app.use(bodyParser.json());

// Example API endpoint to get orders

app.get('/orders', (req, res) => {
  db.query('SELECT * FROM orders', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Endpoint to get line items for a specific order
app.get('/order-line-items/:order_id', (req, res) => {
  const orderId = req.params.order_id;
  db.query('SELECT * FROM order_line_items WHERE order_id = ?', [orderId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
