import bcrypt from 'bcryptjs';
import { User, Organization } from '../models/index.js';
import { sequelize } from '../config/database.js';

// @access  Private
export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { organizationId: req.user.organizationId },
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Member',
            organizationId: req.user.organizationId
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        // Find the user to update
        const userToUpdate = await User.findByPk(id);
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify user belongs to same organization
        if (userToUpdate.organizationId !== req.user.organizationId) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        // Check if we're downgrading the last Admin
        if (userToUpdate.role === 'Admin' && role !== 'Admin') {
            const adminCount = await User.count({
                where: {
                    organizationId: req.user.organizationId,
                    role: 'Admin'
                }
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    message: 'Cannot demote the last Admin. Please transfer ownership or assign another Admin first.',
                    code: 'LAST_ADMIN'
                });
            }
        }

        // Update user
        if (name) userToUpdate.name = name;
        if (email) userToUpdate.email = email;
        if (role) userToUpdate.role = role;

        await userToUpdate.save();

        res.json({
            id: userToUpdate.id,
            name: userToUpdate.name,
            email: userToUpdate.email,
            role: userToUpdate.role,
            organizationId: userToUpdate.organizationId
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the user to delete
        const userToDelete = await User.findByPk(id);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify user belongs to same organization
        if (userToDelete.organizationId !== req.user.organizationId) {
            return res.status(403).json({ message: 'Not authorized to delete this user' });
        }

        // Prevent Admin from deleting themselves
        if (userToDelete.id === req.user.id) {
            return res.status(400).json({
                message: 'You cannot delete your own account. Please transfer ownership to another member first.',
                code: 'SELF_DELETE'
            });
        }

        // Check if deleting the last Admin
        if (userToDelete.role === 'Admin') {
            const adminCount = await User.count({
                where: {
                    organizationId: req.user.organizationId,
                    role: 'Admin'
                }
            });

            if (adminCount <= 1) {
                return res.status(400).json({
                    message: 'Cannot delete the last Admin. Please transfer ownership or assign another Admin first.',
                    code: 'LAST_ADMIN'
                });
            }
        }

        // Delete the user
        await userToDelete.destroy();

        res.json({
            message: 'User deleted successfully',
            deletedUserId: id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @access  Private (Admin only)
export const transferOwnership = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { targetUserId, demoteCurrent } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ message: 'Target user ID is required' });
        }

        // Find the target user
        const targetUser = await User.findByPk(targetUserId, { transaction });
        if (!targetUser) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Target user not found' });
        }

        // Verify target user belongs to same organization
        if (targetUser.organizationId !== req.user.organizationId) {
            await transaction.rollback();
            return res.status(403).json({ message: 'Cannot transfer ownership to user from different organization' });
        }

        // Prevent transferring to yourself
        if (targetUser.id === req.user.id) {
            await transaction.rollback();
            return res.status(400).json({ message: 'You are already an Admin' });
        }

        // Promote target user to Admin
        targetUser.role = 'Admin';
        await targetUser.save({ transaction });

        // Optionally demote current Admin
        if (demoteCurrent) {
            const currentAdmin = await User.findByPk(req.user.id, { transaction });
            currentAdmin.role = 'Member';
            await currentAdmin.save({ transaction });
        }

        await transaction.commit();

        res.json({
            message: 'Ownership transferred successfully',
            newAdmin: {
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role
            },
            demoted: demoteCurrent
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error during ownership transfer' });
    }
};
