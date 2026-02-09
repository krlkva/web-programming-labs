// Состояние приложения
let tasks = [];
let categories = [
    { id: 'work', name: 'Work', color: '#667eea', icon: 'briefcase', tasks: [] },
    { id: 'home', name: 'Home', color: '#4CAF50', icon: 'home', tasks: [] },
    { id: 'other', name: 'Other', color: '#FF9800', icon: 'star', tasks: [] }
];
let currentCategory = 'work';
let draggedTask = null;

// Класс Task
class Task {
    constructor(id, title, description, date, time, category, priority = 'medium', completed = false) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
        this.category = category;
        this.priority = priority;
        this.completed = completed;
        this.createdAt = new Date().toISOString();
        this.order = tasks.length;
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    createAppStructure();
    loadData();
    renderApp();
    setupEventListeners();
    updateDate();
});

// Создание структуры приложения
function createAppStructure() {
    // Основной контейнер
    const app = document.createElement('div');
    app.className = 'todo-app';
    
    // Шапка
    const header = document.createElement('header');
    header.className = 'app-header';
    
    const headerLeft = document.createElement('div');
    headerLeft.className = 'header-left';
    
    const title = document.createElement('h1');
    title.textContent = 'ToDo List';
    
    const dateNav = document.createElement('div');
    dateNav.className = 'date-nav';
    dateNav.innerHTML = `
        <i class="fas fa-chevron-left" id="prev-day"></i>
        <span class="current-date" id="current-date"></span>
        <i class="fas fa-chevron-right" id="next-day"></i>
    `;
    
    headerLeft.appendChild(title);
    headerLeft.appendChild(dateNav);
    
    const headerStats = document.createElement('div');
    headerStats.className = 'header-stats';
    headerStats.innerHTML = `
        <div class="stat-item" id="total-tasks">0 задач</div>
        <div class="stat-item" id="completed-tasks">0 выполнено</div>
    `;
    
    header.appendChild(headerLeft);
    header.appendChild(headerStats);
    
    // Основной контент
    const content = document.createElement('div');
    content.className = 'app-content';
    
    // Сайдбар
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    
    const sidebarMenu = document.createElement('ul');
    sidebarMenu.className = 'sidebar-menu';
    
    const menuItems = [
        { icon: 'chart-pie', text: 'Overview', active: false },
        { icon: 'list', text: 'List', active: true },
        { icon: 'th-large', text: 'Board', active: false },
        { icon: 'stream', text: 'Timeline', active: false },
        { icon: 'calendar', text: 'Calendar', active: false },
        { icon: 'tachometer-alt', text: 'Dashboard', active: false },
        { icon: 'sitemap', text: 'Workflow', active: false }
    ];
    
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.className = `menu-item ${item.active ? 'active' : ''}`;
        li.innerHTML = `<i class="fas fa-${item.icon}"></i> ${item.text}`;
        sidebarMenu.appendChild(li);
    });
    
    const categoriesSection = document.createElement('div');
    categoriesSection.className = 'categories';
    categoriesSection.id = 'categories-list';
    
    const addCategoryBtn = document.createElement('button');
    addCategoryBtn.className = 'add-category-btn';
    addCategoryBtn.innerHTML = '<i class="fas fa-plus"></i> Add Category';
    
    sidebar.appendChild(sidebarMenu);
    sidebar.appendChild(categoriesSection);
    sidebar.appendChild(addCategoryBtn);
    
    // Основная область
    const main = document.createElement('main');
    main.className = 'main-content';
    
    const contentHeader = document.createElement('div');
    contentHeader.className = 'content-header';
    
    const pageTitle = document.createElement('h2');
    pageTitle.textContent = 'Today\'s Tasks';
    
    const contentActions = document.createElement('div');
    contentActions.className = 'content-actions';
    contentActions.innerHTML = `
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="task-search" placeholder="Search tasks...">
        </div>
        <button class="filter-btn" id="filter-btn">
            <i class="fas fa-filter"></i> Filter
        </button>
        <button class="add-task-btn" id="add-task-btn">
            <i class="fas fa-plus"></i> Add Task
        </button>
    `;
    
    contentHeader.appendChild(pageTitle);
    contentHeader.appendChild(contentActions);
    
    const taskColumns = document.createElement('div');
    taskColumns.className = 'task-columns';
    taskColumns.innerHTML = `
        <div class="task-column" id="work-column">
            <div class="column-header">
                <div class="column-title">
                    <i class="fas fa-briefcase"></i>
                    <span>Work</span>
                </div>
                <div class="column-count" id="work-count">0</div>
            </div>
            <ul class="task-list" id="work-tasks"></ul>
        </div>
        <div class="task-column" id="home-column">
            <div class="column-header">
                <div class="column-title">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                </div>
                <div class="column-count" id="home-count">0</div>
            </div>
            <ul class="task-list" id="home-tasks"></ul>
        </div>
        <div class="task-column" id="other-column">
            <div class="column-header">
                <div class="column-title">
                    <i class="fas fa-star"></i>
                    <span>Other</span>
                </div>
                <div class="column-count" id="other-count">0</div>
            </div>
            <ul class="task-list" id="other-tasks"></ul>
        </div>
    `;
    
    main.appendChild(contentHeader);
    main.appendChild(taskColumns);
    
    content.appendChild(sidebar);
    content.appendChild(main);
    
    // Модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'task-modal';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 id="modal-title">Add New Task</h3>
                <button class="close-btn" id="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="task-form">
                    <div class="form-group">
                        <label for="task-title-input">Title</label>
                        <input type="text" id="task-title-input" required>
                    </div>
                    <div class="form-group">
                        <label for="task-description">Description</label>
                        <textarea id="task-description" placeholder="Add description..."></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="task-date">Date</label>
                            <input type="date" id="task-date" required>
                        </div>
                        <div class="form-group">
                            <label for="task-time">Time</label>
                            <input type="time" id="task-time">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="task-category">Category</label>
                            <select id="task-category" required>
                                <option value="work">Work</option>
                                <option value="home">Home</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="task-priority">Priority</label>
                            <select id="task-priority">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="submit" form="task-form" class="btn btn-primary" id="save-btn">Save Task</button>
            </div>
        </div>
    `;
    
    app.appendChild(header);
    app.appendChild(content);
    app.appendChild(modal);
    
    document.body.appendChild(app);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка добавления задачи
    document.getElementById('add-task-btn').addEventListener('click', () => {
        openTaskModal();
    });
    
    // Поиск
    document.getElementById('task-search').addEventListener('input', (e) => {
        filterTasks(e.target.value);
    });
    
    // Кнопка фильтра
    document.getElementById('filter-btn').addEventListener('click', () => {
        // В будущем можно добавить расширенный фильтр
        alert('Filter functionality can be extended here');
    });
    
    // Модальное окно
    document.getElementById('close-modal').addEventListener('click', closeTaskModal);
    document.getElementById('cancel-btn').addEventListener('click', closeTaskModal);
    document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);
    
    // Навигация по датам
    document.getElementById('prev-day').addEventListener('click', () => {
        // Здесь можно добавить функционал переключения дней
        alert('Date navigation can be implemented here');
    });
    
    document.getElementById('next-day').addEventListener('click', () => {
        // Здесь можно добавить функционал переключения дней
        alert('Date navigation can be implemented here');
    });
    
    // Категории в сайдбаре
    document.querySelectorAll('.category').forEach(category => {
        category.addEventListener('click', () => {
            const categoryId = category.dataset.category;
            filterByCategory(categoryId);
        });
    });
}

// Открытие модального окна для добавления/редактирования задачи
function openTaskModal(task = null) {
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('task-form');
    const submitBtn = document.getElementById('save-btn');
    
    if (task) {
        // Редактирование существующей задачи
        modalTitle.textContent = 'Edit Task';
        submitBtn.textContent = 'Update Task';
        form.dataset.editId = task.id;
        
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-date').value = task.date;
        document.getElementById('task-time').value = task.time || '';
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-priority').value = task.priority;
    } else {
        // Добавление новой задачи
        modalTitle.textContent = 'Add New Task';
        submitBtn.textContent = 'Save Task';
        delete form.dataset.editId;
        
        // Сброс формы
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('task-date').value = today;
    }
    
    modal.classList.add('active');
}

// Закрытие модального окна
function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    document.getElementById('task-form').reset();
    delete document.getElementById('task-form').dataset.editId;
}

// Обработка отправки формы задачи
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const editId = form.dataset.editId;
    
    const taskData = {
        title: document.getElementById('task-title-input').value.trim(),
        description: document.getElementById('task-description').value.trim(),
        date: document.getElementById('task-date').value,
        time: document.getElementById('task-time').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value
    };
    
    if (!taskData.title) {
        alert('Please enter a task title');
        return;
    }
    
    if (editId) {
        // Обновление существующей задачи
        updateTask(editId, taskData);
    } else {
        // Добавление новой задачи
        addTask(taskData);
    }
    
    closeTaskModal();
}

// Добавление новой задачи
function addTask(taskData) {
    const task = new Task(
        Date.now().toString(),
        taskData.title,
        taskData.description,
        taskData.date,
        taskData.time,
        taskData.category,
        taskData.priority
    );
    
    tasks.push(task);
    saveData();
    renderApp();
}

// Обновление задачи
function updateTask(taskId, updatedData) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updatedData
        };
        saveData();
        renderApp();
    }
}

// Удаление задачи
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveData();
        renderApp();
    }
}

// Переключение статуса выполнения задачи
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderApp();
    }
}

// Фильтрация задач по поисковому запросу
function filterTasks(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const allTasks = document.querySelectorAll('.task-item');
    
    allTasks.forEach(taskElement => {
        const title = taskElement.querySelector('.task-title').textContent.toLowerCase();
        const description = taskElement.querySelector('.task-description')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchLower) || description.includes(searchLower)) {
            taskElement.style.display = 'block';
        } else {
            taskElement.style.display = 'none';
        }
    });
}

// Фильтрация по категории
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    renderApp();
}

// Обновление даты
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('ru-RU', options);
}

// Обновление статистики
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    document.getElementById('total-tasks').textContent = `${totalTasks} tasks`;
    document.getElementById('completed-tasks').textContent = `${completedTasks} completed`;
    
    // Обновление счетчиков по категориям
    categories.forEach(category => {
        const categoryTasks = tasks.filter(t => t.category === category.id);
        const completedCategoryTasks = categoryTasks.filter(t => t.completed).length;
        const countElement = document.getElementById(`${category.id}-count`);
        
        if (countElement) {
            countElement.textContent = `${categoryTasks.length}`;
        }
        
        // Обновление статистики в сайдбаре
        const categoryElement = document.querySelector(`[data-category="${category.id}"]`);
        if (categoryElement) {
            const statsElement = categoryElement.querySelector('.category-stats');
            if (statsElement) {
                statsElement.textContent = `Completed: ${completedCategoryTasks} / ${categoryTasks.length}`;
            }
            
            // Обновление прогресс-бара
            const progressBar = categoryElement.querySelector('.progress-bar');
            if (progressBar && categoryTasks.length > 0) {
                const progress = (completedCategoryTasks / categoryTasks.length) * 100;
                progressBar.style.width = `${progress}%`;
            }
        }
    });
}

// Рендеринг категорий в сайдбаре
function renderCategories() {
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';
    
    categories.forEach(category => {
        const categoryTasks = tasks.filter(t => t.category === category.id);
        const completedTasks = categoryTasks.filter(t => t.completed).length;
        const progress = categoryTasks.length > 0 ? (completedTasks / categoryTasks.length) * 100 : 0;
        
        const categoryElement = document.createElement('div');
        categoryElement.className = `category category-${category.id}`;
        categoryElement.dataset.category = category.id;
        
        categoryElement.innerHTML = `
            <div class="category-header">
                <div class="category-title">
                    <div class="category-icon">
                        <i class="fas fa-${category.icon}"></i>
                    </div>
                    <span>${category.name}</span>
                </div>
                <div class="category-stats">Completed: ${completedTasks} / ${categoryTasks.length}</div>
            </div>
            <div class="category-progress">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
        `;
        
        categoryElement.addEventListener('click', () => {
            filterByCategory(category.id);
        });
        
        categoriesList.appendChild(categoryElement);
    });
}

// Рендеринг задач по колонкам
function renderTasks() {
    // Очистка всех колонок
    categories.forEach(category => {
        const taskList = document.getElementById(`${category.id}-tasks`);
        taskList.innerHTML = '';
        
        const categoryTasks = tasks
            .filter(t => t.category === category.id)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (categoryTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-column';
            emptyState.innerHTML = `
                <i class="fas fa-tasks"></i>
                <p>No tasks in this category</p>
            `;
            taskList.appendChild(emptyState);
        } else {
            categoryTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }
    });
}

// Создание элемента задачи
function createTaskElement(task) {
    const taskElement = document.createElement('li');
    taskElement.className = `task-item ${task.category} ${task.completed ? 'completed' : ''}`;
    taskElement.dataset.id = task.id;
    taskElement.draggable = true;
    
    const timeDisplay = task.time ? `${task.time}` : 'All day';
    
    taskElement.innerHTML = `
        <div class="task-priority priority-${task.priority}"></div>
        <div class="task-header">
            <div class="task-title">${task.title}</div>
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        </div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
        <div class="task-footer">
            <div class="task-time">
                <i class="far fa-clock"></i>
                ${timeDisplay}
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // Обработчики событий
    const checkbox = taskElement.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
    
    const editBtn = taskElement.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => openTaskModal(task));
    
    const deleteBtn = taskElement.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    // Drag and drop
    taskElement.addEventListener('dragstart', handleDragStart);
    taskElement.addEventListener('dragover', handleDragOver);
    taskElement.addEventListener('drop', handleDrop);
    taskElement.addEventListener('dragend', handleDragEnd);
    
    return taskElement;
}

// Drag and Drop handlers
function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedTask !== this) {
        const taskId = draggedTask.dataset.id;
        const targetColumn = this.closest('.task-list').parentElement.id.replace('-tasks', '');
        
        // Обновление категории задачи
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.category = targetColumn;
            saveData();
            renderApp();
        }
    }
    
    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedTask = null;
}

// Основной рендеринг приложения
function renderApp() {
    renderCategories();
    renderTasks();
    updateStats();
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}

// Загрузка данных из localStorage
function loadData() {
    const savedTasks = localStorage.getItem('todo-tasks');
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
            // Добавляем демо-задачи
            addDemoTasks();
        }
    } else {
        // Добавляем демо-задачи
        addDemoTasks();
    }
}

// Добавление демо-задач
function addDemoTasks() {
    const demoTasks = [
        {
            id: '1',
            title: 'Meeting with client',
            description: 'John Doe from TechX company',
            date: new Date().toISOString().split('T')[0],
            time: '12:00',
            category: 'work',
            priority: 'high',
            completed: false,
            createdAt: new Date().toISOString(),
            order: 0
        },
        {
            id: '2',
            title: 'Grocery shopping',
            description: 'Shopping list: 2 x Rolls, apple juice',
            date: new Date().toISOString().split('T')[0],
            time: '17:00',
            category: 'home',
            priority: 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            order: 1
        },
        {
            id: '3',
            title: 'Prepare presentation',
            description: 'For Unicorn Corp meeting next week',
            date: new Date().toISOString().split('T')[0],
            time: '',
            category: 'work',
            priority: 'high',
            completed: true,
            createdAt: new Date().toISOString(),
            order: 2
        },
        {
            id: '4',
            title: 'Walk the dog',
            description: '',
            date: new Date().toISOString().split('T')[0],
            time: '22:00',
            category: 'other',
            priority: 'low',
            completed: false,
            createdAt: new Date().toISOString(),
            order: 3
        }
    ];
    
    tasks = demoTasks;
    saveData();
}
