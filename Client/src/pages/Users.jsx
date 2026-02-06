import { useEffect, useState, useRef } from 'react';
import api from '../api/api';
import { notifySuccess, notifyError } from '../utility/notify';
import { Plus, Search, User as UserIcon, Shield, Mail, MoreHorizontal, Edit2, Trash2, UserCog, AlertTriangle, ArrowRightLeft, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Users = () => {
    const { user: currentUser, refreshUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const dropdownRef = useRef(null);

    // Form State for Create
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Member'
    });

    // Form State for Edit
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        role: ''
    });

    // Transfer ownership state
    const [transferData, setTransferData] = useState({
        targetUserId: '',
        demoteCurrent: false
    });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            notifyError("Unable to load team members");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            notifySuccess("Invitation sent");
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'Member' });
            fetchUsers();
        } catch (error) {
            notifyError(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${selectedUser.id}`, editData);
            notifySuccess("Member updated");
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            notifyError(error.response?.data?.message || 'Failed to update member');
        }
    };

    const handleDeleteUser = async () => {
        try {
            await api.delete(`/users/${selectedUser.id}`);
            notifySuccess("Member removed");
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            notifyError(error.response?.data?.message || 'Failed to delete member');
        }
    };

    const handleTransferOwnership = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/transfer-ownership', transferData);
            await refreshUser();
            fetchUsers();
            notifySuccess("Ownership transferred");
            setShowTransferModal(false);
            setTransferData({ targetUserId: '', demoteCurrent: false });
        } catch (error) {
            notifyError(error.response?.data?.message || 'Failed to transfer ownership');
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            role: user.role
        });
        setShowEditModal(true);
        setOpenDropdown(null);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
        setOpenDropdown(null);
    };

    if (isLoading) return <div className="p-8 text-white">Loading team...</div>;

    const isAdmin = currentUser?.role === 'Admin';
    const eligibleForTransfer = users.filter(u => u.id !== currentUser?.id && u.role !== 'Admin');

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
                    <p className="text-zinc-400">Manage your organization's members and permissions.</p>
                </div>
                {isAdmin && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowTransferModal(true)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium border border-zinc-700"
                        >
                            <ArrowRightLeft size={20} />
                            Transfer Ownership
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 font-medium"
                        >
                            <Plus size={20} />
                            Invite Member
                        </button>
                    </div>
                )}
            </header>

            {/* User List */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                            <th className="py-4 pl-6 font-medium">User</th>
                            <th className="py-4 font-medium">Role</th>
                            <th className="py-4 font-medium">Status</th>
                            <th className="py-4 font-medium">Joined</th>
                            {isAdmin && <th className="py-4 pr-6"></th>}
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {users.map(u => (
                            <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
                                <td className="py-4 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                {u.name}
                                                {u.id === currentUser?.id && (
                                                    <span className="ml-2 text-xs text-zinc-500">(You)</span>
                                                )}
                                            </p>
                                            <p className="text-zinc-500 text-xs">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${u.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        u.role === 'Leader' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}>
                                        {u.role === 'Admin' && <Shield size={12} />}
                                        {u.role}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Active
                                    </span>
                                </td>
                                <td className="py-4 text-zinc-500">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                {isAdmin && (
                                    <td className="py-4 pr-6 text-right">
                                        <div className="relative" ref={openDropdown === u.id ? dropdownRef : null}>
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === u.id ? null : u.id)}
                                                className="text-zinc-600 hover:text-white transition-colors p-1"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {openDropdown === u.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Edit2 size={14} className="text-indigo-400" />
                                                        Edit Member
                                                    </button>

                                                    {u.id !== currentUser?.id && (
                                                        <button
                                                            onClick={() => openDeleteModal(u)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete Member
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-white mb-6">Invite New Member</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-400 block mb-1.5">Full Name</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-3 top-3 text-zinc-500" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-400 block mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-3 text-zinc-500" />
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        placeholder="jane@company.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 block mb-1.5">Role</label>
                                    <select
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Member">Member</option>
                                        <option value="Leader">Leader</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-400 block mb-1.5">Temp Password</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        placeholder="123456"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 font-medium"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-white mb-6">Edit Member</h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-400 block mb-1.5">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-400 block mb-1.5">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={editData.email}
                                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-400 block mb-1.5">Role</label>
                                <select
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={editData.role}
                                    onChange={e => setEditData({ ...editData, role: e.target.value })}
                                >
                                    <option value="Member">Member</option>
                                    <option value="Leader">Leader</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-5 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle size={24} className="text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Delete Member</h2>
                                <p className="text-sm text-zinc-400 mt-1">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
                            <p className="text-white font-medium mb-1">{selectedUser.name}</p>
                            <p className="text-zinc-500 text-sm">{selectedUser.email}</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-2 ${selectedUser.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                selectedUser.role === 'Leader' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                                }`}>
                                {selectedUser.role}
                            </span>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-5 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20 font-medium"
                            >
                                Delete Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Ownership Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTransferModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <ArrowRightLeft size={24} className="text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Transfer Ownership</h2>
                                <p className="text-sm text-zinc-400 mt-1">Promote another member to Admin</p>
                            </div>
                        </div>

                        <form onSubmit={handleTransferOwnership} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-zinc-400 block mb-1.5">Select New Admin</label>
                                <select
                                    required
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={transferData.targetUserId}
                                    onChange={e => setTransferData({ ...transferData, targetUserId: e.target.value })}
                                >
                                    <option value="">Choose a member...</option>
                                    {eligibleForTransfer.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={transferData.demoteCurrent}
                                        onChange={e => setTransferData({ ...transferData, demoteCurrent: e.target.checked })}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="text-amber-400 font-medium text-sm">Demote myself to Member</p>
                                        <p className="text-amber-400/70 text-xs mt-1">
                                            If unchecked, you will remain as Admin (multiple Admins allowed)
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="px-5 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 font-medium"
                                >
                                    Transfer Ownership
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
