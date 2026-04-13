import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config/api';

function ScheduleManagement() {
    const [schedules, setSchedules] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        route_id: '',
        day_of_week: 0,
        trip_type: 'pickup',
        pickup_time: '',
        drop_time: '',
    });

    useEffect(() => {
        fetchSchedules();
        fetchRoutes();
    }, []);

    const formatTime = (time) => {
        if (!time) return '';

        const [hour, minute] = time.split(':');
        const h = parseInt(hour);

        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 === 0 ? 12 : h % 12;

        return `${formattedHour}:${minute} ${ampm}`;
    };

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/schedules`);
            const data = await response.json();
            setSchedules(data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/routes`);
            const data = await response.json();
            setRoutes(data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['day_of_week', 'route_id'].includes(name) ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId
                ? `${BASE_URL}/api/schedules/${editingId}`
                : `${BASE_URL}/api/schedules`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert(editingId ? 'Schedule updated successfully' : 'Schedule created successfully');
                fetchSchedules();
                resetForm();
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
        }
    };

    const handleEdit = (schedule) => {
        setFormData({
            route_id: schedule.route_id,
            day_of_week: schedule.day_of_week,
            trip_type: schedule.trip_type,
            pickup_time: schedule.pickup_time,
            drop_time: schedule.drop_time,
        });
        setEditingId(schedule.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this schedule?')) return;

        try {
            const response = await fetch(`${BASE_URL}/api/schedules/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Schedule deleted successfully');
                fetchSchedules();
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            route_id: '',
            day_of_week: 0,
            trip_type: 'pickup',
            pickup_time: '',
            drop_time: '',
        });
        setEditingId(null);
    };

    const dayLabel = (day) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day] || day;
    };

    if (loading) {
        return <div className="max-w-6xl mx-auto p-6"><p className="text-center text-gray-600">Loading...</p></div>;
    }

    const dayOrderMap = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
    };

    const sortedSchedules = [...schedules].sort((a, b) => {

        // Route first
        if (a.route_id !== b.route_id) {
            return a.route_id - b.route_id;
        }

        // 🔥 HANDLE BOTH STRING + NUMBER
        const dayA = typeof a.day_of_week === 'number'
            ? a.day_of_week
            : dayOrderMap[a.day_of_week];

        const dayB = typeof b.day_of_week === 'number'
            ? b.day_of_week
            : dayOrderMap[b.day_of_week];

        if (dayA !== dayB) {
            return dayA - dayB;
        }

        // Pickup first, then Drop
        if (a.trip_type === 'pickup') return -1;
        if (b.trip_type === 'pickup') return 1;

        return 0;
    });

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Schedule Management</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    {showForm ? 'Cancel' : '+ Add Schedule'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {editingId ? 'Edit Schedule' : 'Add New Schedule'}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Route */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                            <select
                                name="route_id"
                                value={formData.route_id}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a route</option>
                                {routes.map(route => (
                                    <option key={route.id} value={route.id}>{route.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Day of Week */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                            <select
                                name="day_of_week"
                                value={formData.day_of_week}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                                    <option key={idx} value={idx}>{day}</option>
                                ))}
                            </select>
                        </div>

                        {/* Trip Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
                            <select
                                name="trip_type"
                                value={formData.trip_type}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pickup">Pickup</option>
                                <option value="drop">Drop</option>
                            </select>
                        </div>

                        {/* Pickup Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                            <input
                                type="time"
                                name="pickup_time"
                                value={formData.pickup_time}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Drop Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Drop Time</label>
                            <input
                                type="time"
                                name="drop_time"
                                value={formData.drop_time}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Submit */}
                        <div className="md:col-span-2 flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                {editingId ? 'Update' : 'Create'} Schedule
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(false);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Route</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Day</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trip Type</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pickup</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Drop</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSchedules.map(schedule => (
                            <tr key={schedule.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm text-gray-800">{schedule.route_name}</td>
                                <td className="px-6 py-3 text-sm text-gray-800">{dayLabel(schedule.day_of_week)}</td>
                                <td className="px-6 py-3 text-sm">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${schedule.trip_type === 'pickup'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {schedule.trip_type === 'pickup' ? '🚐 Pickup' : '📍 Drop'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-800">{formatTime(schedule.pickup_time)}</td>
                                <td className="px-6 py-3 text-sm text-gray-800">{formatTime(schedule.drop_time)}</td>
                                <td className="px-6 py-3 text-center text-sm">
                                    <button
                                        onClick={() => handleEdit(schedule)}
                                        className="px-3 py-1 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(schedule.id)}
                                        className="px-3 py-1 text-red-600 hover:text-red-800 font-medium ml-2"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {schedules.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No schedules yet. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ScheduleManagement;
