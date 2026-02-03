import { Task, User } from '../models/index.js';
import { Op } from 'sequelize';

// @access  Private (Leader/Admin)
export const getProductivity = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { organizationId: req.user.organizationId },
            include: [{ model: Task, as: 'assignedTasks' }]
        });

        const productivityData = users.map(user => {
            const total = user.assignedTasks.length;
            const completed = user.assignedTasks.filter(t => t.status === 'Completed').length;
            const score = total === 0 ? 0 : Math.round((completed / total) * 100);

            return {
                id: user.id,
                name: user.name,
                total,
                completed,
                score
            };
        });

        res.json(productivityData.sort((a, b) => b.score - a.score));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Leader/Admin)
export const getRisks = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { organizationId: req.user.organizationId },
            include: [{ model: Task, as: 'assignedTasks' }]
        });

        const risks = [];
        const today = new Date();

        users.forEach(user => {
            const activeTasks = user.assignedTasks.filter(t => t.status !== 'Completed');
            const lateTasks = activeTasks.filter(t => new Date(t.dueDate) < today && t.dueDate !== null);

            // Logic 1: Burnout Risk (More than 5 active tasks)
            if (activeTasks.length > 5) {
                risks.push({
                    type: 'Burnout Risk',
                    user: user.name,
                    details: `${activeTasks.length} active tasks assigned.`
                });
            }

            // Logic 2: Bottleneck (More than 2 late tasks)
            if (lateTasks.length > 2) {
                risks.push({
                    type: 'Bottleneck',
                    user: user.name,
                    details: `${lateTasks.length} tasks are overdue.`
                });
            }
        });

        res.json(risks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Leader/Admin)
export const getTrend = async (req, res) => {
    try {
        const trend = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();

        // Calculate for last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dayName = days[date.getDay()];

            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const completedCount = await Task.count({
                where: {
                    organizationId: req.user.organizationId,
                    status: 'Completed',
                    updatedAt: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });

            trend.push({
                day: dayName,
                count: completedCount,
                date: date.toISOString().split('T')[0]
            });
        }

        res.json(trend);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
