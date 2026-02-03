import { useEffect, useState, useRef } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Plus, MoreHorizontal, Calendar, ArrowRight, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { cn } from '../utils';

const KanbanColumn = ({ title, tasks, status, count, color, onStatusChange, onEdit, onDelete, currentUser }) => {
    return (
        <div className="flex-1 min-w-[320px] bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-4 flex flex-col h-[calc(100vh-140px)]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <h3 className="font-bold text-zinc-100">{title}</h3>
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        {count}
                    </span>
                </div>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                {tasks.map(task => {
                    const isAdmin = currentUser?.role === 'Admin';
                    const isLeader = currentUser?.role === 'Leader';
                    const isMember = currentUser?.role === 'Member';
                    const isAssigned = task.assignedUserId === currentUser?.id;

                    const canEdit = isAdmin || isLeader;
                    const canDelete = isAdmin || (isLeader && task.status !== 'Completed');
                    const canMove = isAdmin || isLeader || (isMember && isAssigned);

                    return (
                        <div
                            key={task.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group relative"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-md border",
                                    task.priority === 'High' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                        task.priority === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                    {task.priority}
                                </span>

                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {canEdit && (
                                        <button
                                            onClick={() => onEdit(task)}
                                            className="p-1 text-zinc-500 hover:text-indigo-400 rounded-lg hover:bg-zinc-800 transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => onDelete(task)}
                                            className="p-1 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h4 className="font-semibold text-zinc-200 mb-2 leading-tight">{task.title}</h4>
                            {task.description && (
                                <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{task.description}</p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50 mt-3 text-xs text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-600 truncate max-w-[80px]">{task.assignee?.name || 'Unassigned'}</span>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-zinc-900">
                                        {task.assignee?.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Status Move Buttons */}
                            {canMove && status !== 'Completed' && (
                                <div className="flex gap-2 mt-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                    <button
                                        onClick={() => onStatusChange(task.id, status === 'Open' ? 'In Progress' : 'Completed')}
                                        className="text-xs bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-400 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        Move <ArrowRight size={10} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Tasks = () => {
    const { user: currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
        dueDate: '',
        assignedUserId: ''
    });

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', formData);
            setShowModal(false);
            resetForm();
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create task');
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/tasks/${selectedTask.id}`, formData);
            setShowEditModal(false);
            resetForm();
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update task');
        }
    };

    const handleDeleteTask = async () => {
        try {
            await api.delete(`/tasks/${selectedTask.id}`);
            setShowDeleteModal(false);
            setSelectedTask(null);
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete task');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            // Optimistic Update
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            await api.put(`/tasks/${taskId}`, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status");
            fetchTasks(); // Revert on error
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            status: 'Open',
            priority: 'Medium',
            dueDate: '',
            assignedUserId: ''
        });
        setSelectedTask(null);
    };

    const openEditModal = (task) => {
        setSelectedTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate || '',
            assignedUserId: task.assignedUserId || ''
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (task) => {
        setSelectedTask(task);
        setShowDeleteModal(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen text-indigo-500">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
        </div>
    );

    const openTasks = tasks.filter(t => t.status === 'Open');
    const progressTasks = tasks.filter(t => t.status === 'In Progress');
    const completedTasks = tasks.filter(t => t.status === 'Completed');

    const canCreate = currentUser?.role === 'Admin' || currentUser?.role === 'Leader';

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Project Board</h1>
                    <p className="text-zinc-400">Manage tasks and track progress.</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 font-medium"
                    >
                        <Plus size={20} />
                        New Task
                    </button>
                )}
            </header>

            {/* Kanban Columns */}
            <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start">
                <KanbanColumn
                    title="To Do"
                    tasks={openTasks}
                    count={openTasks.length}
                    status="Open"
                    color="bg-rose-500"
                    onStatusChange={handleStatusChange}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    currentUser={currentUser}
                />
                <KanbanColumn
                    title="In Progress"
                    tasks={progressTasks}
                    count={progressTasks.length}
                    status="In Progress"
                    color="bg-amber-500"
                    onStatusChange={handleStatusChange}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    currentUser={currentUser}
                />
                <KanbanColumn
                    title="Completed"
                    tasks={completedTasks}
                    count={completedTasks.length}
                    status="Completed"
                    color="bg-emerald-500"
                    onStatusChange={handleStatusChange}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    currentUser={currentUser}
                />
            </div>

            {/* Task Form Modal (Create/Edit) */}
            {(showModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); setShowEditModal(false); }}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">{showEditModal ? 'Update Task' : 'Create New Task'}</h2>
                            <button onClick={() => { setShowModal(false); setShowEditModal(false); }} className="text-zinc-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={showEditModal ? handleUpdateTask : handleCreateTask} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-400">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-400">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all min-h-[100px]"
                                    placeholder="Add details about this task..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-400">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    >
                                        <option value="Open">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-400">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-400">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-400">Assign To</label>
                                    <select
                                        value={formData.assignedUserId}
                                        onChange={e => setFormData({ ...formData, assignedUserId: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setShowEditModal(false); }}
                                    className="px-5 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 font-medium"
                                >
                                    {showEditModal ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedTask && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <AlertCircle size={24} className="text-rose-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Delete Task</h2>
                                <p className="text-sm text-zinc-400 mt-1">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
                            <h4 className="font-semibold text-white mb-1">{selectedTask.title}</h4>
                            <p className="text-zinc-500 text-xs truncate">{selectedTask.description || 'No description'}</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-5 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTask}
                                className="bg-rose-600 text-white px-6 py-2.5 rounded-xl hover:bg-rose-500 transition-colors shadow-lg shadow-rose-500/20 font-medium"
                            >
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
