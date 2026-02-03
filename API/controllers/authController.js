import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Organization } from '../models/index.js';
import { sequelize } from '../config/database.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '12h',
    });
};

export const registerOrg = async (req, res) => {
    const { orgName, userName, email, password } = req.body;

    const t = await sequelize.transaction();

    try {
        // Check if user exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            await t.rollback();
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create Organization
        const organization = await Organization.create({ name: orgName }, { transaction: t });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Admin User
        const user = await User.create({
            name: userName,
            email,
            password: hashedPassword,
            role: 'Admin',
            organizationId: organization.id
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: 'Organization and Admin registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            },
            token: generateToken(user.id)
        });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user email
        const user = await User.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organizationId: user.organizationId
                },
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @access  Private
export const getMe = async (req, res) => {
    res.status(200).json(req.user);
};
