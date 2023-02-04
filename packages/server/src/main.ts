/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// "npx nx serve server" to run test server

interface Error {
  statusCode?: number;
}

import express from 'express';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as dotenv from "dotenv";

dotenv.config({
  path: 'packages/server/.env'
})

export const app: express.Application = express();
app.use(express.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to server!' });
});

// IMPORT ROUTES
import authRouter from '../src/app/routes/auth';

// MOUNT ROUTES
app.use('/', authRouter);

// DATABASE CONNECTION
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB);
}

// SERVER CONNECTION
const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

// ERROR HANDLER
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('ACTION');
  console.log(error);
  
  
  if (!error.statusCode) error.statusCode = 500;

  if (error.statusCode === 301) {
    return res.status(301).redirect('/not-found');
  }

  return res
    .status(error.statusCode)
    .json({ error: error.toString() });
});

// server.on('error', console.error);