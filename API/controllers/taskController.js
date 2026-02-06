import { Task, User } from '../models/index.js';

// @access  Private
export const getTasks = async (req, res) => {
    try {
        // Build where clause based on role
        const whereClause = { organizationId: req.user.organizationId };

        // Members can only see tasks assigned to them
        if (req.user.role === 'Member') {
            whereClause.assignedUserId = req.user.id;
        }
        // Admin and Leader see all organization tasks

        const tasks = await Task.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Leader/Admin)
export const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, assignedUserId } = req.body;

        const completedAt = status === 'Completed'
            ? new Date()
            : null;

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            assignedUserId,
            organizationId: req.user.organizationId,
            completedAt
        });

        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (role-based)
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            where: {
                id: req.params.id,
                organizationId: req.user.organizationId
            }
        });

        if (!task)
            return res.status(404).json({ message: 'Task not found' });

        // member restrictions
        if (req.user.role === 'Member') {

            if (task.assignedUserId !== req.user.id)
                return res.status(403).json({
                    message: 'Members can only update assigned tasks'
                });

            const allowedFields = ['status'];
            const hasInvalid = Object.keys(req.body)
                .some(f => !allowedFields.includes(f));

            if (hasInvalid)
                return res.status(403).json({
                    message: 'Members may only update status'
                });
        }

        const { title, description, status, priority, dueDate, assignedUserId } = req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (assignedUserId !== undefined) task.assignedUserId = assignedUserId;

        // Lifecycle tracking
        if (status !== undefined) {

            if (status === 'Completed' && task.status !== 'Completed')
                task.completedAt = new Date();

            if (status !== 'Completed' && task.status === 'Completed')
                task.completedAt = null;

            task.status = status;
        }

        await task.save();

        res.json(task);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Admin/Leader)
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            where: {
                id: req.params.id,
                organizationId: req.user.organizationId
            }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // leader cannot delete completed tasks (business rule)
        if (req.user.role === 'Leader' && task.status === 'Completed') {
            return res.status(403).json({
                message: 'Leaders cannot delete completed tasks. Please contact an Admin.'
            });
        }

        // Admin can delete any task
        await task.destroy();
        res.json({ message: 'Task removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
