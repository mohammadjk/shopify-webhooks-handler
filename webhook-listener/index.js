const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Import MySQL library
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'dev_user',
    password: 'WimHoff2024!!',
    database: 'cards_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Define the endpoint for the webhook
app.post('/webhook', (req, res) => {
    const data = req.body; // The data sent by Shopify

    // SQL Insert for main order details
    const sql = `INSERT INTO orders 
        (order_id, order_number, financial_status, fulfillment_status, total_price, currency, created_at, customer_locale, payment_gateway_names) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        data.id,
        data.order_number,
        data.financial_status,
        data.fulfillment_status,
        data.total_price,
        data.currency,
        data.created_at,
        data.customer_locale,
        data.payment_gateway_names.join(', ')
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).send('Database error');
        }
        console.log('Order inserted:', result.insertId);

        // Insert each line item
        const lineItemSql = `INSERT INTO order_line_items 
            (order_id, item_id, product_name, quantity, sku, price, product_id, variant_id) 
            VALUES ?`;

        const lineItemValues = data.line_items.map(item => [
            data.id,
            item.id,
            item.name,
            item.quantity,
            item.sku,
            item.price,
            item.product_id,
            item.variant_id
        ]);

        db.query(lineItemSql, [lineItemValues], (err) => {
            if (err) {
                console.error('Error inserting line items:', err);
                return res.status(500).send('Database error');
            }
            console.log('Line items inserted');
            res.status(200).send('Webhook received and processed');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
