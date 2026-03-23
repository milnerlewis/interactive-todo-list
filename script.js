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

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error("Failed to load tasks from localStorage", error);
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(title, priority) {
    tasks.push({
        id: Date.now().toString(),
        title,
        completed: false,
        priority: priority || "medium",
    });

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
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

function getFilteredTasks() {
    if (currentFilter === "active") {
        return tasks.filter((task) => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter((task) => task.completed);
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

function renderTasks() {
    const filteredTasks = prioritySorting(getFilteredTasks());
    taskList.innerHTML = "";

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.className = `task-item${task.completed ? " completed" : ""}`;

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" data-action="toggle" data-id="${task.id}" ${task.completed ? "checked" : ""} />
                <span class="task-priority ${task.priority}" data-action="edit-title" data-id="${task.id}">${task.priority}</span>
                <span class="task-title" data-action="edit-title" data-id="${task.id}">${task.title}</span>
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

    addTask(title, priority);
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
        toggleTask(id);
    }
});

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
