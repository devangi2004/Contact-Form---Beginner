const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for validated submissions
const submissions = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Return submissions (for quick verification)
app.get('/submissions', (req, res) => {
  res.json({ ok: true, data: submissions });
});

// Server-side validation for form submissions
app.post('/submit', (req, res) => {
  const { name, email, age, message } = req.body;

  const errors = {};

  // Basic validations (must mirror client expectations)
  if (!name || String(name).trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(String(email))) {
    errors.email = 'Please provide a valid email address.';
  }

  const numericAge = Number(age);
  if (!Number.isFinite(numericAge) || !Number.isInteger(numericAge)) {
    errors.age = 'Age must be an integer.';
  } else if (numericAge < 13 || numericAge > 120) {
    errors.age = 'Age must be between 13 and 120.';
  }

  const msg = typeof message === 'string' ? message.trim() : '';
  if (!msg) {
    errors.message = 'Message is required.';
  } else if (msg.length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  } else if (msg.length > 500) {
    errors.message = 'Message must be fewer than 500 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  const record = {
    id: submissions.length + 1,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    age: numericAge,
    message: msg,
    createdAt: new Date().toISOString(),
  };

  submissions.push(record);

  return res.json({ ok: true, message: 'Submitted successfully!', record });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});


