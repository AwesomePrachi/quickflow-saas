import { Task, User } from '../models/index.js';
import { Op } from 'sequelize';

// @access  Private (Leader/Admin)
export const getProductivity = async (req, res) => {
    try {

        const windowStart = new Date();
        windowStart.setDate(windowStart.getDate() - 7);

        const users = await User.findAll({
            where: { organizationId: req.user.organizationId },
            include: [{
                model: Task,
                as: 'assignedTasks',
                where: {
                    createdAt: { [Op.gte]: windowStart }
                },
                required: false
            }]
        });

        const data = users.map(u => {

            const total = u.assignedTasks.length;
            const completed = u.assignedTasks
                .filter(t => t.completedAt !== null).length;

            return {
                id: u.id,
                name: u.name,
                total,
                completed,
                score: total === 0 ? 0 : Math.round((completed / total) * 100)
            };
        });

        res.json(data.sort((a, b) => b.score - a.score));

    } catch (err) {
        console.error(err);
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const risks = [];

        users.forEach(u => {

            const active = u.assignedTasks
                .filter(t => t.status !== 'Completed');

            const late = active.filter(t => {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                d.setHours(0, 0, 0, 0);
                return d < today;
            });

            // priority weighted scoring
            let priorityScore = 0;

            active.forEach(t => {
                if (t.priority === 'High') priorityScore += 1.5;
                else if (t.priority === 'Medium') priorityScore += 1;
                else priorityScore += 0.5;    // Low
            });

            // final workload score
            const workloadScore =
                active.length +
                (late.length * 1.5) +
                priorityScore;

            // burnout detection
            if (workloadScore >= 7)
                risks.push({
                    type: 'Burnout Risk',
                    user: u.name,
                    details: `Workload score ${workloadScore.toFixed(1)}`
                });

            if (late.length >= 3)
                risks.push({
                    type: 'Bottleneck',
                    user: u.name,
                    details: `${late.length} overdue tasks`
                });
        });

        res.json(risks);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Leader/Admin)
export const getTrend = async (req, res) => {
    try {

        const trend = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {

            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));

            const count = await Task.count({
                where: {
                    organizationId: req.user.organizationId,
                    completedAt: {
                        [Op.between]: [start, end]
                    }
                }
            });

            trend.push({
                day: start.toLocaleDateString('en-US', { weekday: 'short' }),
                count,
                date: start.toISOString().split('T')[0]
            });
        }

        res.json(trend);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
