import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getProjectTasks, getProjects } from "../../services/projectService";
import { useParams } from "react-router-dom";

function ProjectCalendar() {
    const { projectId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(projectId || "");
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        if (!selectedProject) return;
        setLoading(true);
        try {
            const data = await getProjectTasks(selectedProject);
            const tasksArray = Array.isArray(data) ? data : data.data || [];
            const events = tasksArray.map((task) => ({
                id: task.id,
                title: task.title,
                start: task.due_date || new Date(),
                extendedProps: {
                    description: task.description,
                    status: task.status,
                },
            }));
            setTasks(events);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const data = await getProjects();
            setProjects(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            setProjects([]);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [selectedProject]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Project Calendar
                </h1>

                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Minimized Calendar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-4 max-w-4xl mx-auto">
                {loading ? (
                    <div className="py-20 text-center text-slate-500 dark:text-slate-400">
                        Loading tasks...
                    </div>
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        events={tasks}
                        eventClick={(info) => {
                            alert(
                                `Task: ${info.event.title}\nStatus: ${info.event.extendedProps.status}\nDescription: ${info.event.extendedProps.description}`
                            );
                        }}
                        editable={false}
                        selectable={true}
                        height={500} // fixed smaller height
                        contentHeight={480} // ensures events fit nicely
                        eventBackgroundColor="#3b82f6"
                        eventBorderColor="#2563eb"
                        eventTextColor="#fff"
                        dayHeaderFormat={{ weekday: "short" }}
                    />
                )}
            </div>
        </div>
    );
}

export default ProjectCalendar;
