// Active filter 
function setActiveFilter(filter) {
    // Update current filter
    currentFilter = filter;
    
    // Update active class on filter buttons
    filterButtons.forEach(button => {
        if (button.dataset.filter === filter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Apply the filter
    applyFilter(filter);
}

// Apply filter 
function applyFilter(filter) {
    const taskElements = document.querySelectorAll('.task-item');
    
    taskElements.forEach(taskElement => {
        const taskId = taskElement.dataset.id;
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;
        
        switch (filter) {
            case 'all':
                taskElement.style.display = 'flex';
                break;
            case 'pending':
                taskElement.style.display = task.completed ? 'none' : 'flex';
                break;
            case 'completed':
                taskElement.style.display = task.completed ? 'flex' : 'none';
                break;
        }
    });
}

// Toggle sort order 
function toggleSortOrder() {
    // Toggle sort state
    sortByNewest = !sortByNewest;
    
    // Update button text
    sortBtn.innerHTML = sortByNewest ? 
        '<i class="fas fa-sort"></i> Sort by Newest' : 
        '<i class="fas fa-sort"></i> Sort by Oldest';
    
    // Sort tasks
    sortTasks();
    
    // Re-render task list
    renderAllTasks();
    
    // Apply current filter
    applyFilter(currentFilter);
}

// Sort tasks based on current sort order
function sortTasks() {
    tasks.sort((a, b) => {
        if (sortByNewest) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
    });
}

// Re-render all tasks in the DOM
function renderAllTasks() {
    // Clear existing task list
    taskList.innerHTML = '';
    
    // Render all tasks
    tasks.forEach(task => renderTask(task));
}

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
.shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake {
    10%, 90% { transform: translateX(-1px); }
    20%, 80% { transform: translateX(2px); }
    30%, 50%, 70% { transform: translateX(-4px); }
    40%, 60% { transform: translateX(4px); }
}`;
document.head.appendChild(style);




// Task array to store all tasks
let tasks = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyListMessage = document.getElementById('empty-list-message');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortBtn = document.getElementById('sort-btn');

// Current filter state - default to 'all'
let currentFilter = 'all';

// Sort state - default to true (newest first)
let sortByNewest = true;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load tasks from localStorage
    loadTasks();
    
    // Event listeners
    taskForm.addEventListener('submit', addTask);
    
    // Add filter event listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveFilter(button.dataset.filter);
        });
    });
    
    // Add sort event listener
    sortBtn.addEventListener('click', toggleSortOrder);
    
    // Initialize the task list
    updateEmptyListMessage();
});

// Add a new task to the tasks array and DOM
function addTask(e) {
    e.preventDefault();
    
    // Get task text and trim whitespace
    const taskText = taskInput.value.trim();
    
    // Validate input
    if (taskText === '') {
        shakeElement(taskInput);
        return;
    }
    
    // Create new task object
    const newTask = {
        id: generateUniqueId(),
        text: taskText,
        completed: false,
        createdAt: new Date()
    };
    
    // Add task to array (at the beginning for newest first)
    tasks.unshift(newTask);
    
    // Clear input field
    taskInput.value = '';
    
    // Render the task in DOM
    renderTask(newTask);
    
    // Update empty list message visibility
    updateEmptyListMessage();
    
    // Save to localStorage
    saveTasks();
}

//Generate a unique ID for each task
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Render a single task in the DOM
function renderTask(task) {
    const taskElement = document.createElement('li');
    taskElement.classList.add('task-item');
    taskElement.dataset.id = task.id;
    
    if (task.completed) {
        taskElement.classList.add('completed');
    }
    
    // Format the date
    const formattedDate = formatDate(task.createdAt);
    
    // Create task HTML
    taskElement.innerHTML = `
        <div class="task-content">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskCompletion('${task.id}')"></div>
            <div>
                <p class="task-text">${task.text}</p>
                <span class="task-date">${formattedDate}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="delete-btn" onclick="deleteTask('${task.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add to DOM (at the beginning of the list)
    taskList.prepend(taskElement);
}

// Format date to a readable string
function formatDate(date) {
    const now = new Date();
    const taskDate = new Date(date);
    
    // If today, show time
    if (taskDate.toDateString() === now.toDateString()) {
        return `Today at ${taskDate.getHours()}:${taskDate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (taskDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    
    // Otherwise show full date
    return taskDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
    });
}

// Delete a task
function deleteTask(taskId) {
    // Find task element in DOM
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    
    // Add removal animation
    taskElement.style.opacity = '0';
    taskElement.style.transform = 'translateX(30px)';
    taskElement.style.transition = 'all 0.3s ease';
    
    // Remove from DOM after animation
    setTimeout(() => {
        taskElement.remove();
        
        // Remove from tasks array
        tasks = tasks.filter(task => task.id !== taskId);
        
        // Update empty list message
        updateEmptyListMessage();
        
        // Save to localStorage
        saveTasks();
    }, 300);
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
    // Find the task in the array
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    // Toggle completion status
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    
    // Update DOM
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    const checkbox = taskElement.querySelector('.task-checkbox');
    
    if (tasks[taskIndex].completed) {
        taskElement.classList.add('completed');
        checkbox.classList.add('checked');
    } else {
        taskElement.classList.remove('completed');
        checkbox.classList.remove('checked');
    }
    
    // Apply current filter (may need to hide/show based on completion status)
    applyFilter(currentFilter);
    
    // Save to localStorage
    saveTasks();
}

// Update empty list message visibility
function updateEmptyListMessage() {
    if (tasks.length === 0) {
        emptyListMessage.style.display = 'block';
    } else {
        emptyListMessage.style.display = 'none';
    }
}

// Add shake animation to an element
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    // Get tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedTasks) {
        // Parse saved tasks
        tasks = JSON.parse(savedTasks);
        
        // Convert date strings back to Date objects
        tasks.forEach(task => {
            task.createdAt = new Date(task.createdAt);
        });
        
        // Clear task list first
        taskList.innerHTML = '';
        
        // Render all tasks
        tasks.forEach(task => {
            renderTask(task);
        });
        
        // Update empty list message
        updateEmptyListMessage();
    }
}