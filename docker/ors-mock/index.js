const express = require('express');
const morgan = require('morgan');


const app = express();
const port = process.env.PORT || 8082;

app.use(morgan('dev'));
app.use(express.json());

// Basic health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mock directions endpoint: POST /ors/v2/directions/:profile
app.post(['/ors/v2/directions/:profile', '/ors/v2/directions/:profile/'], (req, res) => {
  const { profile } = req.params;
  const { coordinates } = req.body || {};

  // Very small mock route: return simple LineString connecting coords
  let geometry = null;
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    geometry = {
      type: 'LineString',
      coordinates: coordinates,
    };
  } else {
    geometry = {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [0.001, 0.001],
      ],
    };
  }

  const feature = {
    type: 'Feature',
    properties: {
      segments: [
        {
          distance: 1000,
          duration: 600,
          steps: [],
        },
      ],
    },
    geometry,
  };

  res.json({
    type: 'FeatureCollection',
    features: [feature],
    info: { query: { profile } },
  });
});

// basic fallback POST handler to mimic ORS older endpoint path
app.post(['/ors/v2/matrix', '/ors/v2/matrix/'], (req, res) => {
  res.json({ distances: [[]], times: [[]] });
});

app.listen(port, () => {
  console.log(`ORS mock listening on port ${port}`);
});
