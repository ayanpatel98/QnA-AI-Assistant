import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupStudentRoutes } from './studentchat';
import { ApiResponse } from './models/types';

// environment variables from .env file
dotenv.config();

const app: express.Application = express();
const PORT: number = parseInt(process.env.PORT || '5000');

app.use(cors());
app.use(express.json());

// Setup student-related routes
setupStudentRoutes(app);

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  const errorResponse: ApiResponse = {
    success: false, 
    message: 'Internal server error'
  };
  res.status(500).json(errorResponse);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;