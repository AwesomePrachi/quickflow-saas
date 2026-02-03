import { Task, User } from '../models/index.js';

// @access  Private (Leader/Admin)
export const exportTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { organizationId: req.user.organizationId },
            include: [{ model: User, as: 'assignee', attributes: ['name'] }],
            order: [['createdAt', 'ASC']]
        });

        // Manual CSV construction
        const headers = ['ID', 'Title', 'Status', 'Priority', 'Due Date', 'Assignee', 'Created At'];

        const rows = tasks.map((task, index) => [
            index + 1,
            `"${task.title.replace(/"/g, '""')}"`, // Escape quotes
            task.status,
            task.priority,
            task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            task.assignee ? `"${task.assignee.name}"` : 'Unassigned',
            new Date(task.createdAt).toISOString().split('T')[0]
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="tasks_report.csv"');
        res.send(csvContent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
