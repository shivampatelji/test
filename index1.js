// index.js
import express from 'express';
import routes from './routes.js';

const app = express();
app.use('/', routes);

const port = 3000;

// Start the server
app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
