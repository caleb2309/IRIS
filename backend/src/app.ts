import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/taskRouterMistral.js'; 
dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

app.use('/api', router);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'IRIS Backend API is running!' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).send('Something broke!');
});


export default app;
