const STORAGE_KEY = "interactive-todo-list.tasks";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const countAll = document.getElementById("count-all");
const countActive = document.getElementById("count-active");
const countCompleted = document.getElementById("count-completed");
const filterButtons = document.querySelectorAll(".filter-btn");
const priorityOrder = {high: 0, medium: 1, low: 2};
const prioritySequence = ["high", "medium", "low"];
const prioritySelect = document.getElementById("task-priority");
const lastClickedKey = "interactive-todo-list.lastClickedTaskId";
const taskDueDate = document.getElementById("task-due-date");
const advancedToggle = document.getElementById("advanced-toggle");
const advancedFilters = document.getElementById("advanced-filters");

let tasks = loadTasks();
let currentFilter = "all";
let lastClickedTaskId = localStorage.getItem(lastClickedKey);

function setLastClickedTask(id) {
    lastClickedTaskId = id;
    if (id) localStorage.setItem(lastClickedKey, id);
    else localStorage.removeItem(lastClickedKey);
}

function loadTasks() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new Error("Invalid tasks data");
        return parsed.map((task) => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            priority: task.priority || "medium",
            createdAt: task.createdAt || new Date().toISOString(),
            dueDate: task.dueDate || null,
        }));
    } catch (e) {
        console.error("Failed to load tasks:", e);
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(title, priority, dueDate) {
    tasks.push({
        id: Date.now().toString(),
        title,
        completed: false,
        priority: priority || "medium",
        createdAt: new Date().toISOString(),
        dueDate: dueDate || null,
    });

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    if (lastClickedTaskId === id) {
        setLastClickedTask(null);
    }
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map((task) => {
        if (task.id !== id) {
            return task;
        }

        return {
            ...task,
            completed: !task.completed,
        };
    });

    saveTasks();
    renderTasks();
}

function updateCounters() {
    const all = tasks.length;
    const active = tasks.filter((task) => !task.completed).length;
    const completed = all - active;

    countAll.textContent = all.toString();
    countActive.textContent = active.toString();
    countCompleted.textContent = completed.toString();
}

function isToday(dateString) {
    const today = new Date().toDateString();
    return new Date(dateString).toDateString() === today;
}

function isUpcoming(dateString) {
    const today = new Date();
    const sevenDaysAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueDate = new Date(dateString);
    return dueDate > today && dueDate <= sevenDaysAhead;
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
}

function getFilteredTasks() {
    if (currentFilter === "active") {
        return tasks.filter((task) => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter((task) => task.completed);
    }

    if (currentFilter === "overdue") {
        return tasks.filter((task) => !task.completed && task.dueDate && isOverdue(task.dueDate));
    }

    if (currentFilter === "today") {
        return tasks.filter((task) => !task.completed && task.dueDate && isToday(task.dueDate));
    }

    if (currentFilter === "upcoming") {
        return tasks.filter((task) => !task.completed && task.dueDate && isUpcoming(task.dueDate));
    }

    return tasks;
}

function updateTaskTitle(id, newTitle) {
    tasks = tasks.map((task) => (task.id === id ? { ...task, title: newTitle } : task));
    saveTasks();
    renderTasks();
}

function startInlineTitleEdit(titleElement, id) {
    const currentTitle = titleElement.textContent || "";
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentTitle;
    input.className = "task-title-input";

    const commit = () => {
        const trimmed = input.value.trim();
        if (trimmed) updateTaskTitle(id, trimmed);
        else renderTasks();
    };

    const cancel = () => renderTasks();

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") cancel();
    });

    titleElement.replaceWith(input);
    input.focus();
    input.select();
}

function cycleTaskPriority(id) {
    tasks = tasks.map((task) => {
        if (task.id !== id) {
            return task;
        }

        const currentIndex = prioritySequence.indexOf(task.priority);
        const nextIndex = (currentIndex + 1) % prioritySequence.length;
        return { ...task, priority: prioritySequence[nextIndex] };
    });
    saveTasks();
    renderTasks();
}

function prioritySorting(tasks) {
    // make copy of all tasks
    const sorted = [...tasks];
    // sort using priority rankings
    // 0 = high, 1 = medium, 2 = low
    sorted.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] ?? 1;
        const priorityB = priorityOrder[b.priority] ?? 1;
        return priorityA - priorityB;
    });
    return sorted;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !tasks.find(t => t.dueDate === dueDate && t.completed);
}

function renderTasks() {
    const filteredTasks = prioritySorting(getFilteredTasks());
    taskList.innerHTML = "";

    filteredTasks.forEach((task) => {
        const isLastClicked = lastClickedTaskId === task.id;
        const li = document.createElement("li");
        li.className = `task-item${task.completed ? " completed" : ""}${isLastClicked ? " last-clicked" : ""}`;
        li.dataset.taskId = task.id;


        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" data-action="toggle" data-id="${task.id}" ${task.completed ? "checked" : ""} />
                <span class="task-priority ${task.priority}" data-action="cycle-priority" data-id="${task.id}">${task.priority}</span>
                <span class="task-title" data-action="edit-title" data-id="${task.id}">${task.title}</span>            
            </div>
            <div class="task-meta">
                <span class="task-created">Created: ${new Date(task.createdAt).toLocaleDateString()}</span>
                ${task.dueDate ? `<span class="task-due">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ""}
            </div>
            <div class="task-actions">
                <button type="button" data-action="delete" data-id="${task.id}">Delete</button>
            </div>
        `;

        taskList.appendChild(li);
    });

    emptyState.style.display = filteredTasks.length === 0 ? "block" : "none";
    updateCounters();
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (!title) {
        return;
    }

    addTask(title, priority, taskDueDate.value || null);
    taskInput.value = "";
    taskInput.focus();
});

taskList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (!action || !id) {
        return;
    }

    const taskItem = target.closest(".task-item");
    if (taskItem instanceof HTMLElement && taskItem.dataset.taskId) {
        setLastClickedTask(taskItem.dataset.taskId);
        taskList.querySelectorAll(".task-item.last-clicked").forEach((item) => {
            item.classList.remove("last-clicked");
        });
    }

    if (action === "delete") {
        deleteTask(id);
    }

    if (action === "edit-title") {
        startInlineTitleEdit(target, id);
        return;
    }

    if (action === "cycle-priority") {
        cycleTaskPriority(id);
        return;
    }
});

taskList.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
        return;
    }

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === "toggle" && id) {
        setLastClickedTask(id);
        toggleTask(id);
    }
});

advancedToggle.addEventListener("click", () => {
    advancedFilters.classList.toggle("hidden");
});

advancedFilters.classList.add("hidden");

advancedToggle.classList.toggle("active",
                                currentFilter !== "all" &&
                                currentFilter !== "active" &&
                                currentFilter !== "completed");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter || "all";

        filterButtons.forEach((item) => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });
});

renderTasks();
