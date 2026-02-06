import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    status: {
        type: DataTypes.ENUM('Open', 'In Progress', 'Completed'),
        defaultValue: 'Open'
    },

    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium'
    },

    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // analytics critical
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    assignedUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },

    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Organizations',
            key: 'id'
        }
    }

}, {
    timestamps: true,
    indexes: [
        { fields: ['organizationId'] },
        { fields: ['assignedUserId'] },
        { fields: ['status'] },
        { fields: ['completedAt'] }
    ]
});

export default Task;
