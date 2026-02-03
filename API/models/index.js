import Organization from './Organization.js';
import User from './User.js';
import Task from './Task.js';
import { sequelize } from './Organization.js';

// Define Associations

// Organization has many users
Organization.hasMany(User, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
User.belongsTo(Organization, { foreignKey: 'organizationId' });

// Organization has many tasks
Organization.hasMany(Task, { foreignKey: 'organizationId', onDelete: 'CASCADE' });
Task.belongsTo(Organization, { foreignKey: 'organizationId' });

// User (Assignee) has many tasks assigned to them
User.hasMany(Task, { foreignKey: 'assignedUserId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedUserId', as: 'assignee' });

export {
    sequelize,
    Organization,
    User,
    Task
};
