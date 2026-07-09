import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subjectRoutes from './routes/subjects.js';
import taskRoutes from './routes/tasks.js';
import timelogRoutes from './routes/timelogs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('UPSC Timeline Study Planner API is running'));

// Routes
app.use('/api/subjects', subjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/timelogs', timelogRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
