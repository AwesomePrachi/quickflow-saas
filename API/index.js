import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/reports', reportRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Connect to database and start server
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database connected successfully.');

        await sequelize.sync({ alter: true });
        console.log('Database Synced');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
