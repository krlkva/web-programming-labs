// Состояние приложения
let tasks = [];
let currentFilter = 'all';
let currentSort = 'date-asc';
let currentSearch = '';
let draggedTask = null;
let editingTaskId = null;

// Класс задачи
class Task {
    constructor(id, title, date, completed = false) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.completed = completed;
        this.createdAt = new Date().toISOString();
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
    const app = document.createElement('div');
    app.className = 'todo-app';
    
    // Шапка
    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
        <h1>ToDo List</h1>
        <p>Организуйте свои задачи эффективно</p>
    `;
    
    // Основной контент
    const content = document.createElement('div');
    content.className = 'app-content';
    
    // Форма добавления задачи
    const form = document.createElement('div');
    form.className = 'add-task-form';
    form.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="task-title">Название задачи</label>
                <input type="text" id="task-title" placeholder="Введите название задачи">
            </div>
            <div class="form-group">
                <label for="task-date">Дата выполнения</label>
                <input type="date" id="task-date">
            </div>
        </div>
        <button class="add-button" id="add-task-btn">
            <span style="font-size: 18px; line-height: 1;">+</span> Добавить задачу
        </button>
    `;
    
    // Управление (поиск, фильтр, сортировка)
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
        <div class="search-box">
            <input type="text" id="task-search" placeholder="Поиск задач...">
        </div>
        <div class="filter-row">
            <div class="filter-group">
                <label for="task-filter">Фильтр</label>
                <select id="task-filter">
                    <option value="all">Все задачи</option>
                    <option value="active">Активные</option>
                    <option value="completed">Выполненные</option>
                </select>
            </div>
            <div class="sort-group">
                <label for="task-sort">Сортировка</label>
                <select id="task-sort">
                    <option value="date-asc">Дата (по возрастанию)</option>
                    <option value="date-desc">Дата (по убыванию)</option>
                    <option value="title-asc">Название (А-Я)</option>
                    <option value="title-desc">Название (Я-А)</option>
                </select>
            </div>
        </div>
    `;
    
    // Контейнер задач
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    tasksContainer.innerHTML = `
        <div class="tasks-header">
            <h2>Мои задачи</h2>
            <div class="task-count" id="task-count">0 задач</div>
        </div>
        <ul class="task-list" id="task-list"></ul>
    `;
    
    // Модальное окно для редактирования
    const editModal = document.createElement('div');
    editModal.className = 'edit-modal';
    editModal.id = 'edit-modal';
    editModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Редактировать задачу</h3>
                <button class="modal-close" id="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-task-form">
                    <div class="form-group">
                        <label for="edit-task-title">Название задачи</label>
                        <input type="text" id="edit-task-title" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-task-date">Дата выполнения</label>
                        <input type="date" id="edit-task-date" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="modal-cancel">Отмена</button>
                <button type="submit" form="edit-task-form" class="btn btn-primary" id="modal-save">Сохранить</button>
            </div>
        </div>
    `;
    
    content.appendChild(form);
    content.appendChild(controls);
    content.appendChild(tasksContainer);
    
    app.appendChild(header);
    app.appendChild(content);
    app.appendChild(editModal);
    
    document.body.appendChild(app);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Добавление задачи
    document.getElementById('add-task-btn').addEventListener('click', addTask);
    
    // Поиск
    document.getElementById('task-search').addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderTasks();
    });
    
    // Фильтр
    document.getElementById('task-filter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTasks();
    });
    
    // Сортировка
    document.getElementById('task-sort').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });
    
    // Модальное окно редактирования
    document.getElementById('modal-close').addEventListener('click', closeEditModal);
    document.getElementById('modal-cancel').addEventListener('click', closeEditModal);
    document.getElementById('edit-task-form').addEventListener('submit', saveEditedTask);
    
    // Добавление задачи по Enter в поле названия
    document.getElementById('task-title').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });
}

// Добавление новой задачи
function addTask() {
    const titleInput = document.getElementById('task-title');
    const dateInput = document.getElementById('task-date');
    
    const title = titleInput.value.trim();
    const date = dateInput.value;
    
    if (!title) {
        alert('Пожалуйста, введите название задачи');
        titleInput.focus();
        return;
    }
    
    if (!date) {
        alert('Пожалуйста, выберите дату выполнения');
        dateInput.focus();
        return;
    }
    
    const task = new Task(
        Date.now().toString(),
        title,
        date
    );
    
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

// Переключение статуса выполнения
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// Открытие модального окна для редактирования
function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-date').value = task.date;
    
    document.getElementById('edit-modal').classList.add('active');
    document.getElementById('edit-task-title').focus();
}

// Закрытие модального окна
function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
    editingTaskId = null;
}

// Сохранение отредактированной задачи
function saveEditedTask(e) {
    e.preventDefault();
    
    if (!editingTaskId) return;
    
    const title = document.getElementById('edit-task-title').value.trim();
    const date = document.getElementById('edit-task-date').value;
    
    if (!title || !date) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
        task.title = title;
        task.date = date;
        saveTasksToLocalStorage();
        renderTasks();
    }
    
    closeEditModal();
}

// Фильтрация задач
function filterTasks() {
    let filteredTasks = [...tasks];
    
    // Фильтрация по статусу
    if (currentFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Поиск
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
    const filteredTasks = filterTasks();
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    let countText = `${totalTasks} задач`;
    if (totalTasks > 0) {
        countText += ` (${activeTasks} активных, ${completedTasks} выполненных)`;
    }
    
    document.getElementById('task-count').textContent = countText;
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
        
        if (currentSearch || currentFilter !== 'all') {
            emptyState.innerHTML = `
                <h3>Задачи не найдены</h3>
                <p>Попробуйте изменить критерии поиска или фильтрации</p>
            `;
        } else {
            emptyState.innerHTML = `
                <h3>Нет задач</h3>
                <p>Добавьте свою первую задачу!</p>
            `;
        }
        
        taskList.appendChild(emptyState);
    } else {
        sortedTasks.forEach(task => {
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
    
    // Чекбокс
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
    date.textContent = formatDate(task.date);
    
    content.appendChild(title);
    content.appendChild(date);
    
    // Кнопки действий
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(task.id);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Удалить';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            deleteTask(task.id);
        }
    });
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    // Сборка элемента
    taskItem.appendChild(checkbox);
    taskItem.appendChild(content);
    taskItem.appendChild(actions);
    
    // Drag and drop
    taskItem.addEventListener('dragstart', handleDragStart);
    taskItem.addEventListener('dragover', handleDragOver);
    taskItem.addEventListener('drop', handleDrop);
    taskItem.addEventListener('dragend', handleDragEnd);
    
    return taskItem;
}

// Drag and drop обработчики
function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedTask !== this) {
        const draggedId = draggedTask.dataset.id;
        const targetId = this.dataset.id;
        
        const draggedIndex = tasks.findIndex(t => t.id === draggedId);
        const targetIndex = tasks.findIndex(t => t.id === targetId);
        
        if (draggedIndex > -1 && targetIndex > -1) {
            // Перемещаем задачу в массиве
            const [removed] = tasks.splice(draggedIndex, 1);
            tasks.splice(targetIndex, 0, removed);
            
            saveTasksToLocalStorage();
            renderTasks();
        }
    }
    
    return false;
}

function handleDragEnd() {
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
        // Формат: дд.мм.гггг
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
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
            tasks = JSON.parse(savedTasks);
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            tasks = [];
        }
    }
}
