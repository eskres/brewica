import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

interface Error {
  statusCode?: number;
}

dotenv.config({
  path: 'packages/server/.env'
})

const host = process.env['HOST'] ?? 'localhost';
const port = process.env['PORT'] ? Number(process.env['PORT']) : 3001;

export const app: express.Application = express();

app.use(express.json());
app.use(express.urlencoded());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// SERVER CONNECTION
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

app.get('/', (req, res) => {
  res.send('Hello world!');
});

// IMPORT ROUTES
import authRouter from './app/routes/auth';

// MOUNT ROUTES
app.use('/', authRouter);

// DATABASE CONNECTION
if (process.env['NODE_ENV'] !== 'test' && process.env['MONGODB']) {
  mongoose.connect(process.env['MONGODB']);
}

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