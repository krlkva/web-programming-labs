// Основные переменные и состояние приложения
let tasks = [];
let currentFilter = 'all';
let currentSort = 'date-asc';
let currentSearch = '';
let draggedTask = null;

// Класс Task для создания задач
class Task {
    constructor(id, title, date, completed = false) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.completed = completed;
        this.createdAt = new Date().toISOString();
        this.order = tasks.length;
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    createAppStructure();
    loadTasksFromLocalStorage();
    renderTasks();
    setupEventListeners();
});

// Создание структуры приложения
function createAppStructure() {
    // Создание основного контейнера
    const container = document.createElement('div');
    container.className = 'todo-container';
    
    // Создание заголовка
    const header = document.createElement('header');
    header.className = 'todo-header';
    
    const title = document.createElement('h1');
    title.textContent = 'ToDo List';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Организуйте свои задачи эффективно';
    
    header.appendChild(title);
    header.appendChild(subtitle);
    
    // Создание основного содержимого
    const content = document.createElement('div');
    content.className = 'todo-content';
    
    // Форма добавления задачи
    const form = document.createElement('form');
    form.className = 'add-task-form';
    
    const titleInputGroup = document.createElement('div');
    titleInputGroup.className = 'input-group';
    
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Название задачи';
    titleLabel.htmlFor = 'task-title';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'task-title';
    titleInput.placeholder = 'Введите название задачи';
    titleInput.required = true;
    
    titleInputGroup.appendChild(titleLabel);
    titleInputGroup.appendChild(titleInput);
    
    const dateInputGroup = document.createElement('div');
    dateInputGroup.className = 'input-group';
    
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Дата выполнения';
    dateLabel.htmlFor = 'task-date';
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'task-date';
    dateInput.required = true;
    
    dateInputGroup.appendChild(dateLabel);
    dateInputGroup.appendChild(dateInput);
    
    const addButton = document.createElement('button');
    addButton.type = 'submit';
    addButton.className = 'add-button';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Добавить задачу';
    
    form.appendChild(titleInputGroup);
    form.appendChild(dateInputGroup);
    form.appendChild(addButton);
    
    // Контейнер для управления
    const controls = document.createElement('div');
    controls.className = 'controls';
    
    // Поиск
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'task-search';
    searchInput.placeholder = 'Поиск задач...';
    
    const searchIcon = document.createElement('i');
    searchIcon.className = 'fas fa-search';
    
    searchBox.appendChild(searchIcon);
    searchBox.appendChild(searchInput);
    
    // Фильтрация и сортировка
    const filterSortContainer = document.createElement('div');
    filterSortContainer.className = 'filter-sort';
    
    const filterSelect = document.createElement('select');
    filterSelect.id = 'task-filter';
    
    const filterOptions = [
        { value: 'all', text: 'Все задачи' },
        { value: 'active', text: 'Активные' },
        { value: 'completed', text: 'Выполненные' }
    ];
    
    filterOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        filterSelect.appendChild(optionElement);
    });
    
    const sortSelect = document.createElement('select');
    sortSelect.id = 'task-sort';
    
    const sortOptions = [
        { value: 'date-asc', text: 'Дата (по возрастанию)' },
        { value: 'date-desc', text: 'Дата (по убыванию)' },
        { value: 'title-asc', text: 'Название (А-Я)' },
        { value: 'title-desc', text: 'Название (Я-А)' }
    ];
    
    sortOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        sortSelect.appendChild(optionElement);
    });
    
    filterSortContainer.appendChild(filterSelect);
    filterSortContainer.appendChild(sortSelect);
    
    controls.appendChild(searchBox);
    controls.appendChild(filterSortContainer);
    
    // Контейнер для задач
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    
    const tasksHeader = document.createElement('div');
    tasksHeader.className = 'tasks-header';
    
    const tasksTitle = document.createElement('h2');
    tasksTitle.textContent = 'Мои задачи';
    
    const taskCount = document.createElement('div');
    taskCount.className = 'task-count';
    taskCount.id = 'task-count';
    taskCount.textContent = '0 задач';
    
    tasksHeader.appendChild(tasksTitle);
    tasksHeader.appendChild(taskCount);
    
    const taskList = document.createElement('ul');
    taskList.className = 'task-list';
    taskList.id = 'task-list';
    
    tasksContainer.appendChild(tasksHeader);
    tasksContainer.appendChild(taskList);
    
    // Сборка всей структуры
    content.appendChild(form);
    content.appendChild(controls);
    content.appendChild(tasksContainer);
    
    container.appendChild(header);
    container.appendChild(content);
    
    // Добавление в body
    document.body.appendChild(container);
}

// Настройка обработчиков событий
function setupEventListeners() {
    const form = document.querySelector('.add-task-form');
    const searchInput = document.getElementById('task-search');
    const filterSelect = document.getElementById('task-filter');
    const sortSelect = document.getElementById('task-sort');
    
    // Добавление задачи
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask();
    });
    
    // Поиск задач
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderTasks();
    });
    
    // Фильтрация задач
    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTasks();
    });
    
    // Сортировка задач
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });
}

// Добавление новой задачи
function addTask() {
    const titleInput = document.getElementById('task-title');
    const dateInput = document.getElementById('task-date');
    
    const title = titleInput.value.trim();
    const date = dateInput.value;
    
    if (!title || !date) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    const id = Date.now().toString();
    const task = new Task(id, title, date);
    tasks.push(task);
    
    saveTasksToLocalStorage();
    renderTasks();
    
    // Сброс формы
    titleInput.value = '';
    dateInput.value = '';
    titleInput.focus();
}

// Удаление задачи
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToLocalStorage();
    renderTasks();
}

// Переключение статуса задачи
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Редактирование задачи
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newTitle = prompt('Редактировать название задачи:', task.title);
    if (newTitle !== null) {
        task.title = newTitle.trim();
        
        const newDate = prompt('Редактировать дату выполнения (YYYY-MM-DD):', task.date);
        if (newDate !== null) {
            task.date = newDate;
        }
        
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Фильтрация задач
function filterTasks() {
    let filteredTasks = tasks;
    
    // Фильтрация по статусу
    if (currentFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Поиск по названию
    if (currentSearch) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(currentSearch)
        );
    }
    
    return filteredTasks;
}

// Сортировка задач
function sortTasks(tasksList) {
    const sortedTasks = [...tasksList];
    
    switch (currentSort) {
        case 'date-asc':
            sortedTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'date-desc':
            sortedTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'title-asc':
            sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sortedTasks.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    return sortedTasks;
}

// Обновление счетчика задач
function updateTaskCount() {
    const taskCount = document.getElementById('task-count');
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    let countText = '';
    if (currentFilter === 'all') {
        countText = `${totalTasks} задач (${activeTasks} активных, ${completedTasks} выполненных)`;
    } else if (currentFilter === 'active') {
        const filteredTasks = tasks.filter(task => !task.completed);
        countText = `${filteredTasks.length} активных задач`;
    } else {
        const filteredTasks = tasks.filter(task => task.completed);
        countText = `${filteredTasks.length} выполненных задач`;
    }
    
    taskCount.textContent = countText;
}

// Отрисовка задач
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    const filteredTasks = filterTasks();
    const sortedTasks = sortTasks(filteredTasks);
    
    if (sortedTasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        emptyState.innerHTML = `
            <i class="fas fa-tasks"></i>
            <h3>Задачи не найдены</h3>
            <p>${currentSearch || currentFilter !== 'all' ? 'Попробуйте изменить критерии поиска или фильтрации' : 'Добавьте свою первую задачу!'}</p>
        `;
        
        taskList.appendChild(emptyState);
    } else {
        sortedTasks.forEach((task, index) => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });
    }
    
    updateTaskCount();
}

// Создание элемента задачи
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.id = `task-${task.id}`;
    taskItem.draggable = true;
    taskItem.dataset.id = task.id;
    
    // Чекбокс для отметки выполнения
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
    
    // Содержимое задачи
    const content = document.createElement('div');
    content.className = 'task-content';
    
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    
    const date = document.createElement('div');
    date.className = 'task-date';
    date.innerHTML = `<i class="far fa-calendar"></i> ${formatDate(task.date)}`;
    
    content.appendChild(title);
    content.appendChild(date);
    
    // Кнопки действий
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'action-btn edit-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = 'Редактировать';
    editButton.addEventListener('click', () => editTask(task.id));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-btn delete-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.title = 'Удалить';
    deleteButton.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            deleteTask(task.id);
        }
    });
    
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    
    // Сборка элемента
    taskItem.appendChild(checkbox);
    taskItem.appendChild(content);
    taskItem.appendChild(actions);
    
    // Добавление обработчиков для drag-and-drop
    setupDragAndDrop(taskItem);
    
    return taskItem;
}

// Настройка drag-and-drop
function setupDragAndDrop(taskItem) {
    taskItem.addEventListener('dragstart', handleDragStart);
    taskItem.addEventListener('dragover', handleDragOver);
    taskItem.addEventListener('drop', handleDrop);
    taskItem.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (draggedTask !== this) {
        const draggedId = draggedTask.dataset.id;
        const targetId = this.dataset.id;
        
        // Обновление порядка в массиве tasks
        const draggedIndex = tasks.findIndex(t => t.id === draggedId);
        const targetIndex = tasks.findIndex(t => t.id === targetId);
        
        if (draggedIndex > -1 && targetIndex > -1) {
            const [removed] = tasks.splice(draggedIndex, 1);
            tasks.splice(targetIndex, 0, removed);
            
            // Обновление порядка в localStorage
            saveTasksToLocalStorage();
            renderTasks();
        }
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedTask = null;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Завтра';
    } else {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Сохранение в localStorage
function saveTasksToLocalStorage() {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}

// Загрузка из localStorage
function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('todo-tasks');
    if (savedTasks) {
        try {
            const parsedTasks = JSON.parse(savedTasks);
            tasks = parsedTasks.map(taskData => {
                const task = new Task(taskData.id, taskData.title, taskData.date, taskData.completed);
                task.createdAt = taskData.createdAt;
                task.order = taskData.order || 0;
                return task;
            });
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            tasks = [];
        }
    }
}
