require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Keep the token in .env (gitignored): PRIVATE_APP_ACCESS
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

const OBJECT_TYPE = 'deals';

// Internal property names (confirm in HubSpot: Settings > Properties > Deals)
const PROPERTIES = ['dealname', 'project_type', 'notes'];
const COLUMN_LABELS = ['Deal Name', 'Project Type', 'Notes'];

// Deals require a pipeline and stage when created.
// 'default' / 'appointmentscheduled' are the stock values; check yours if the POST fails.
const PIPELINE = 'default';
const DEAL_STAGE = 'appointmentscheduled';

const headers = {
  Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
  'Content-Type': 'application/json',
};

const BASE_URL = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}`;

// 1. Homepage: GET deals and render table
app.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(BASE_URL, {
      headers,
      params: { properties: PROPERTIES.join(','), limit: 100 },
    });
    res.render('homepage', {
      title: 'Deals | Integrating With HubSpot I Practicum',
      records: data.results,
      properties: PROPERTIES,
      labels: COLUMN_LABELS,
    });
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).send('Error fetching records. Check the console.');
  }
});

// 2. Render the form
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

// 3. Handle form submission: POST new deal, then redirect home
app.post('/update-cobj', async (req, res) => {
  const body = {
    properties: {
      dealname: req.body.dealname,
      project_type: req.body.project_type,
      notes: req.body.notes,
      pipeline: PIPELINE,
      dealstage: DEAL_STAGE,
    },
  };
  try {
    await axios.post(BASE_URL, body, { headers });
    res.redirect('/');
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).send('Error creating record. Check the console.');
  }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));