import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Organization = sequelize.define('Organization', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    timestamps: true
});

export { sequelize };
export default Organization;
