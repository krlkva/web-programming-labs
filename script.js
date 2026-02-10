// Основной скрипт приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('Приложение ToDo List загружается...');
    
    // Инициализация приложения
    initApp();
});

/**
 * Инициализация приложения
 */
function initApp() {
    console.log('Инициализация приложения...');
    
    // Создание структуры страницы
    createPageStructure();
    
    // Загрузка задач из localStorage
    loadTasksFromStorage();
    
    // Инициализация обработчиков событий
    initEventListeners();
}

/**
 * Создание структуры страницы
 */
function createPageStructure() {
    // Создание контейнера приложения
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';
    document.body.appendChild(appContainer);
    
    // Создание заголовка
    createHeader(appContainer);
    
    // Создание основной части приложения
    createMainContent(appContainer);
    
    // Создание подвала
    createFooter(appContainer);
}

/**
 * Создание заголовка приложения
 */
function createHeader(container) {
    const header = document.createElement('header');
    header.className = 'app-header';
    
    const headerContent = document.createElement('div');
    headerContent.className = 'header-content';
    
    // Логотип и название
    const logoSection = document.createElement('div');
    logoSection.className = 'logo-section';
    
    const appTitle = document.createElement('h1');
    appTitle.className = 'app-title';
    appTitle.textContent = 'ToDo List';
    
    const appSubtitle = document.createElement('p');
    appSubtitle.className = 'app-subtitle';
    appSubtitle.textContent = 'Минималистичный менеджер задач';
    
    logoSection.appendChild(appTitle);
    logoSection.appendChild(appSubtitle);
    
    headerContent.appendChild(logoSection);
    header.appendChild(headerContent);
    container.appendChild(header);
}

/**
 * Создание основной части приложения
 */
function createMainContent(container) {
    const main = document.createElement('main');
    main.className = 'main-content';
    
    // Боковая панель с элементами управления
    const sidebar = createSidebar();
    
    // Основная область с задачами
    const taskArea = createTaskArea();
    
    main.appendChild(sidebar);
    main.appendChild(taskArea);
    container.appendChild(main);
}

/**
 * Создание боковой панели
 */
function createSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    
    // Форма добавления задачи
    const addTaskForm = document.createElement('div');
    addTaskForm.className = 'add-task-form';
    
    const formTitle = document.createElement('h2');
    formTitle.className = 'form-title';
    formTitle.textContent = 'Новая задача';
    
    // Поле ввода названия задачи
    const titleInputContainer = document.createElement('div');
    titleInputContainer.className = 'input-container';
    
    const titleLabel = document.createElement('label');
    titleLabel.className = 'input-label';
    titleLabel.textContent = 'Название';
    titleLabel.htmlFor = 'task-title';
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'task-title';
    titleInput.className = 'task-input';
    titleInput.placeholder = 'Введите название задачи';
    
    titleInputContainer.appendChild(titleLabel);
    titleInputContainer.appendChild(titleInput);
    
    // Поле ввода описания
    const descriptionInputContainer = document.createElement('div');
    descriptionInputContainer.className = 'input-container';
    
    const descriptionLabel = document.createElement('label');
    descriptionLabel.className = 'input-label';
    descriptionLabel.textContent = 'Описание (необязательно)';
    descriptionLabel.htmlFor = 'task-description';
    
    const descriptionInput = document.createElement('textarea');
    descriptionInput.id = 'task-description';
    descriptionInput.className = 'task-textarea';
    descriptionInput.placeholder = 'Добавьте описание задачи';
    descriptionInput.rows = 3;
    
    descriptionInputContainer.appendChild(descriptionLabel);
    descriptionInputContainer.appendChild(descriptionInput);
    
    // Поле выбора даты
    const dateInputContainer = document.createElement('div');
    dateInputContainer.className = 'input-container';
    
    const dateLabel = document.createElement('label');
    dateLabel.className = 'input-label';
    dateLabel.textContent = 'Дата выполнения';
    dateLabel.htmlFor = 'task-date';
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'task-date';
    dateInput.className = 'task-input';
    
    // Установка минимальной даты на сегодня
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    
    dateInputContainer.appendChild(dateLabel);
    dateInputContainer.appendChild(dateInput);
    
    // Кнопка добавления задачи
    const addButton = document.createElement('button');
    addButton.id = 'add-task-btn';
    addButton.className = 'btn add-btn';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Добавить задачу';
    
    // Панель фильтров и сортировки
    const filtersPanel = document.createElement('div');
    filtersPanel.className = 'filters-panel';
    
    const filtersTitle = document.createElement('h2');
    filtersTitle.className = 'filters-title';
    filtersTitle.textContent = 'Фильтры';
    
    // Поле поиска
    const searchContainer = document.createElement('div');
    searchContainer.className = 'input-container';
    
    const searchLabel = document.createElement('label');
    searchLabel.className = 'input-label';
    searchLabel.textContent = 'Поиск';
    searchLabel.htmlFor = 'task-search';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'task-search';
    searchInput.className = 'task-input';
    searchInput.placeholder = 'Поиск по названию...';
    
    searchContainer.appendChild(searchLabel);
    searchContainer.appendChild(searchInput);
    
    // Фильтр по статусу
    const statusFilterContainer = document.createElement('div');
    statusFilterContainer.className = 'filter-container';
    
    const statusFilterLabel = document.createElement('label');
    statusFilterLabel.className = 'filter-label';
    statusFilterLabel.textContent = 'Статус';
    
    const statusFilter = document.createElement('select');
    statusFilter.id = 'status-filter';
    statusFilter.className = 'filter-select';
    
    const statusOptions = [
        { value: 'all', text: 'Все задачи' },
        { value: 'active', text: 'Активные' },
        { value: 'completed', text: 'Выполненные' }
    ];
    
    statusOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        statusFilter.appendChild(optionElement);
    });
    
    statusFilterContainer.appendChild(statusFilterLabel);
    statusFilterContainer.appendChild(statusFilter);
    
    // Сортировка по дате
    const sortContainer = document.createElement('div');
    sortContainer.className = 'filter-container';
    
    const sortLabel = document.createElement('label');
    sortLabel.className = 'filter-label';
    sortLabel.textContent = 'Сортировка';
    
    const sortSelect = document.createElement('select');
    sortSelect.id = 'sort-by-date';
    sortSelect.className = 'filter-select';
    
    const sortOptions = [
        { value: 'newest', text: 'Сначала новые' },
        { value: 'oldest', text: 'Сначала старые' },
        { value: 'nearest', text: 'Ближайшие сроки' }
    ];
    
    sortOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        sortSelect.appendChild(optionElement);
    });
    
    sortContainer.appendChild(sortLabel);
    sortContainer.appendChild(sortSelect);
    
    // Кнопка сброса фильтров
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-filters-btn';
    resetButton.className = 'btn reset-btn';
    resetButton.innerHTML = '<i class="fas fa-redo"></i> Сбросить фильтры';
    
    // Сборка формы
    addTaskForm.appendChild(formTitle);
    addTaskForm.appendChild(titleInputContainer);
    addTaskForm.appendChild(descriptionInputContainer);
    addTaskForm.appendChild(dateInputContainer);
    addTaskForm.appendChild(addButton);
    
    // Сборка панели фильтров
    filtersPanel.appendChild(filtersTitle);
    filtersPanel.appendChild(searchContainer);
    filtersPanel.appendChild(statusFilterContainer);
    filtersPanel.appendChild(sortContainer);
    filtersPanel.appendChild(resetButton);
    
    sidebar.appendChild(addTaskForm);
    sidebar.appendChild(filtersPanel);
    
    return sidebar;
}

/**
 * Создание области задач
 */
function createTaskArea() {
    const taskArea = document.createElement('section');
    taskArea.className = 'task-area';
    
    // Заголовок области задач
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    
    const taskTitle = document.createElement('h2');
    taskTitle.className = 'task-title';
    taskTitle.textContent = 'Задачи';
    
    const taskStats = document.createElement('div');
    taskStats.id = 'task-stats';
    taskStats.className = 'task-stats';
    taskStats.textContent = 'Всего: 0 | Активные: 0 | Выполнено: 0';
    
    taskHeader.appendChild(taskTitle);
    taskHeader.appendChild(taskStats);
    
    // Контейнер для списка задач
    const taskListContainer = document.createElement('div');
    taskListContainer.className = 'task-list-container';
    
    const taskList = document.createElement('ul');
    taskList.id = 'task-list';
    taskList.className = 'task-list';
    
    // Сообщение при пустом списке
    const emptyMessage = document.createElement('div');
    emptyMessage.id = 'empty-message';
    emptyMessage.className = 'empty-message';
    emptyMessage.innerHTML = `
        <i class="fas fa-clipboard-list"></i>
        <h3>Нет задач</h3>
        <p>Добавьте свою первую задачу</p>
    `;
    emptyMessage.style.display = 'block';
    
    taskListContainer.appendChild(taskList);
    taskListContainer.appendChild(emptyMessage);
    
    taskArea.appendChild(taskHeader);
    taskArea.appendChild(taskListContainer);
    
    return taskArea;
}

/**
 * Создание подвала приложения
 */
function createFooter(container) {
    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    
    const footerContent = document.createElement('div');
    footerContent.className = 'footer-content';
    
    const copyright = document.createElement('p');
    copyright.className = 'copyright';
    copyright.innerHTML = '&copy; ' + new Date().getFullYear() + ' ToDo List';
    
    const localStorageInfo = document.createElement('div');
    localStorageInfo.id = 'storage-info';
    localStorageInfo.className = 'storage-info';
    localStorageInfo.innerHTML = '<i class="fas fa-database"></i> Локальное хранилище';
    
    footerContent.appendChild(copyright);
    footerContent.appendChild(localStorageInfo);
    
    footer.appendChild(footerContent);
    container.appendChild(footer);
}

// Модель данных приложения
let tasks = [];
let currentId = 1;

// Класс задачи
class Task {
    constructor(id, title, description, date, completed = false) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.completed = completed;
        this.createdAt = new Date().toISOString();
    }
}

/**
 * Инициализация обработчиков событий
 */
function initEventListeners() {
    // Кнопка добавления задачи
    const addButton = document.getElementById('add-task-btn');
    if (addButton) {
        addButton.addEventListener('click', addNewTask);
    } else {
        console.error('Кнопка добавления задачи не найдена!');
    }
    
    // Обработка нажатия Enter в поле ввода названия
    const titleInput = document.getElementById('task-title');
    if (titleInput) {
        titleInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addNewTask();
            }
        });
    }
    
    // Обработчики для фильтров
    const searchInput = document.getElementById('task-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterTasks);
    }
    
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTasks);
    }
    
    const sortSelect = document.getElementById('sort-by-date');
    if (sortSelect) {
        sortSelect.addEventListener('change', filterTasks);
    }
    
    // Кнопка сброса фильтров
    const resetButton = document.getElementById('reset-filters-btn');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
}

/**
 * Добавление новой задачи
 */
function addNewTask() {
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');
    const dateInput = document.getElementById('task-date');
    
    // Проверка существования элементов
    if (!titleInput || !descriptionInput || !dateInput) {
        console.error('Элементы формы не найдены!');
        return;
    }
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const date = dateInput.value;
    
    console.log('Добавление задачи:', { title, description, date });
    
    // Валидация
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
    
    // Создание новой задачи
    const taskId = currentId++;
    const newTask = new Task(taskId, title, description, date);
    
    // Добавление в массив задач
    tasks.push(newTask);
    
    // Сохранение в localStorage
    saveTasksToStorage();
    
    // Очистка формы
    titleInput.value = '';
    descriptionInput.value = '';
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Обновление отображения
    renderTasks();
    
    // Фокус на поле ввода названия
    titleInput.focus();
    
    // Показать уведомление
    showNotification('Задача добавлена', 'success');
}

/**
 * Отображение списка задач
 */
function renderTasks() {
    const taskList = document.getElementById('task-list');
    const emptyMessage = document.getElementById('empty-message');
    
    if (!taskList || !emptyMessage) {
        console.error('Элементы списка задач не найдены!');
        return;
    }
    
    // Очистка списка
    taskList.innerHTML = '';
    
    // Если задач нет, показать сообщение
    if (tasks.length === 0) {
        emptyMessage.style.display = 'block';
        updateTaskStats();
        return;
    }
    
    // Скрыть сообщение о пустом списке
    emptyMessage.style.display = 'none';
    
    // Отображение задач
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
    
    // Обновление статистики
    updateTaskStats();
    
    // Инициализация drag-and-drop
    initDragAndDrop();
}

/**
 * Создание элемента задачи для отображения
 */
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.id = `task-${task.id}`;
    taskItem.draggable = true;
    
    // Определение приоритета по дате
    const taskDate = new Date(task.date);
    const today = new Date();
    const timeDiff = taskDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let priorityClass = '';
    if (daysDiff < 0) {
        priorityClass = 'priority-high'; // Просроченные
    } else if (daysDiff <= 2) {
        priorityClass = 'priority-high'; // Срочные (сегодня-завтра)
    } else if (daysDiff <= 7) {
        priorityClass = 'priority-medium'; // Средний приоритет
    } else {
        priorityClass = 'priority-low'; // Низкий приоритет
    }
    
    taskItem.classList.add(priorityClass);
    
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    // Форматирование даты
    const formattedDate = formatDate(task.date);
    
    // Создание содержимого задачи
    taskItem.innerHTML = `
        <div class="task-header-row">
            <div class="task-title-row">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-name">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-date">${formattedDate}</div>
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-actions">
            <button class="action-btn edit-btn" title="Редактировать задачу">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" title="Удалить задачу">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Добавление обработчиков событий для элементов задачи
    const checkbox = taskItem.querySelector('.task-checkbox');
    if (checkbox) {
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
    }
    
    const editButton = taskItem.querySelector('.edit-btn');
    if (editButton) {
        editButton.addEventListener('click', () => editTask(task.id));
    }
    
    const deleteButton = taskItem.querySelector('.delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => deleteTask(task.id));
    }
    
    return taskItem;
}

/**
 * Переключение статуса выполнения задачи
 */
function toggleTaskComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        // Сохранение в localStorage
        saveTasksToStorage();
        
        // Обновление отображения
        renderTasks();
        
        // Показать уведомление
        const status = tasks[taskIndex].completed ? 'выполнена' : 'активна';
        showNotification(`Задача "${tasks[taskIndex].title}" отмечена как ${status}`, 'info');
    }
}

/**
 * Редактирование задачи
 */
function editTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    // Создание модального окна для редактирования
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Редактировать задачу</h3>
            <div class="input-container">
                <label class="input-label">Название</label>
                <input type="text" id="edit-task-title" class="task-input" value="${escapeHtml(task.title)}">
            </div>
            <div class="input-container">
                <label class="input-label">Описание</label>
                <textarea id="edit-task-description" class="task-textarea" rows="3">${escapeHtml(task.description)}</textarea>
            </div>
            <div class="input-container">
                <label class="input-label">Дата выполнения</label>
                <input type="date" id="edit-task-date" class="task-input" value="${task.date}">
            </div>
            <div class="modal-actions">
                <button id="save-edit-btn" class="btn">Сохранить</button>
                <button id="cancel-edit-btn" class="btn">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики событий для модального окна
    const saveButton = document.getElementById('save-edit-btn');
    const cancelButton = document.getElementById('cancel-edit-btn');
    
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const newTitle = document.getElementById('edit-task-title').value.trim();
            const newDescription = document.getElementById('edit-task-description').value.trim();
            const newDate = document.getElementById('edit-task-date').value;
            
            // Валидация
            if (!newTitle) {
                alert('Пожалуйста, введите название задачи');
                return;
            }
            
            if (!newDate) {
                alert('Пожалуйста, выберите дату выполнения');
                return;
            }
            
            // Обновление задачи
            tasks[taskIndex].title = newTitle;
            tasks[taskIndex].description = newDescription;
            tasks[taskIndex].date = newDate;
            
            // Сохранение в localStorage
            saveTasksToStorage();
            
            // Обновление отображения
            renderTasks();
            
            // Закрытие модального окна
            document.body.removeChild(modal);
            
            // Показать уведомление
            showNotification('Задача обновлена', 'success');
        });
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
    
    // Закрытие при клике вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Удаление задачи
 */
function deleteTask(taskId) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const taskTitle = tasks[taskIndex].title;
        
        // Удаление задачи из массива
        tasks.splice(taskIndex, 1);
        
        // Сохранение в localStorage
        saveTasksToStorage();
        
        // Обновление отображения
        renderTasks();
        
        // Показать уведомление
        showNotification('Задача удалена', 'warning');
    }
}

/**
 * Фильтрация и сортировка задач
 */
function filterTasks() {
    const searchInput = document.getElementById('task-search');
    const statusFilter = document.getElementById('status-filter');
    const sortSelect = document.getElementById('sort-by-date');
    
    if (!searchInput || !statusFilter || !sortSelect) {
        console.error('Элементы фильтров не найдены!');
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const sortBy = sortSelect.value;
    
    let filteredTasks = tasks.filter(task => {
        // Поиск по названию
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) || 
                             task.description.toLowerCase().includes(searchTerm);
        
        // Фильтрация по статусу
        let matchesStatus = true;
        if (status === 'active') {
            matchesStatus = !task.completed;
        } else if (status === 'completed') {
            matchesStatus = task.completed;
        }
        
        return matchesSearch && matchesStatus;
    });
    
    // Сортировка
    filteredTasks.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (sortBy === 'newest') {
            return dateB - dateA;
        } else if (sortBy === 'oldest') {
            return dateA - dateB;
        } else if (sortBy === 'nearest') {
            // Сначала просроченные, затем ближайшие по дате
            const today = new Date();
            const diffA = dateA - today;
            const diffB = dateB - today;
            
            // Если обе задачи просрочены или обе в будущем
            if (diffA < 0 && diffB < 0) return dateB - dateA; // Просроченные: самые старые сначала
            if (diffA >= 0 && diffB >= 0) return dateA - dateB; // Будущие: ближайшие сначала
            
            // Если одна просрочена, а другая нет
            return diffA < 0 ? -1 : 1; // Просроченные сначала
        }
        
        return 0;
    });
    
    // Временное отображение отфильтрованных задач
    displayFilteredTasks(filteredTasks);
}

/**
 * Отображение отфильтрованных задач
 */
function displayFilteredTasks(filteredTasks) {
    const taskList = document.getElementById('task-list');
    const emptyMessage = document.getElementById('empty-message');
    
    if (!taskList || !emptyMessage) {
        console.error('Элементы списка задач не найдены!');
        return;
    }
    
    // Очистка списка
    taskList.innerHTML = '';
    
    // Если задач нет, показать сообщение
    if (filteredTasks.length === 0) {
        emptyMessage.style.display = 'block';
        updateTaskStats();
        return;
    }
    
    // Скрыть сообщение о пустом списке
    emptyMessage.style.display = 'none';
    
    // Отображение отфильтрованных задач
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
    
    // Обновление статистики
    updateTaskStats();
}

/**
 * Сброс фильтров
 */
function resetFilters() {
    const searchInput = document.getElementById('task-search');
    const statusFilter = document.getElementById('status-filter');
    const sortSelect = document.getElementById('sort-by-date');
    
    if (searchInput && statusFilter && sortSelect) {
        searchInput.value = '';
        statusFilter.value = 'all';
        sortSelect.value = 'newest';
        
        // Отображение всех задач
        renderTasks();
        
        // Показать уведомление
        showNotification('Фильтры сброшены', 'info');
    }
}

/**
 * Обновление статистики задач
 */
function updateTaskStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    const taskStats = document.getElementById('task-stats');
    if (taskStats) {
        taskStats.textContent = `Всего: ${totalTasks} | Активные: ${activeTasks} | Выполнено: ${completedTasks}`;
    }
}

/**
 * Инициализация drag-and-drop
 */
function initDragAndDrop() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;
    
    const taskItems = taskList.querySelectorAll('.task-item');
    
    taskItems.forEach(taskItem => {
        taskItem.addEventListener('dragstart', handleDragStart);
        taskItem.addEventListener('dragend', handleDragEnd);
    });
    
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('dragenter', handleDragEnter);
    taskList.addEventListener('dragleave', handleDragLeave);
    taskList.addEventListener('drop', handleDrop);
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    const taskList = document.getElementById('task-list');
    if (taskList) {
        taskList.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (draggedItem !== this) {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;
        
        const items = Array.from(taskList.querySelectorAll('.task-item'));
        
        const draggedIndex = items.indexOf(draggedItem);
        const targetIndex = items.indexOf(this);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Получаем ID задач из элементов
            const draggedId = parseInt(draggedItem.id.replace('task-', ''));
            const targetId = parseInt(this.id.replace('task-', ''));
            
            // Находим задачи в массиве
            const draggedTaskIndex = tasks.findIndex(task => task.id === draggedId);
            const targetTaskIndex = tasks.findIndex(task => task.id === targetId);
            
            if (draggedTaskIndex !== -1 && targetTaskIndex !== -1) {
                // Перемещаем задачу в массиве
                const [draggedTask] = tasks.splice(draggedTaskIndex, 1);
                tasks.splice(targetTaskIndex, 0, draggedTask);
                
                // Сохраняем изменения в localStorage
                saveTasksToStorage();
                
                // Обновляем отображение
                renderTasks();
                
                // Показываем уведомление
                showNotification('Порядок задач изменен', 'info');
            }
        }
    }
    
    this.classList.remove('drag-over');
    return false;
}

/**
 * Сохранение задач в localStorage
 */
function saveTasksToStorage() {
    try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        localStorage.setItem('todoCurrentId', currentId.toString());
        
        // Обновление информации в подвале
        const storageInfo = document.getElementById('storage-info');
        if (storageInfo) {
            storageInfo.innerHTML = '<i class="fas fa-database"></i> Данные сохранены';
            
            // Через 2 секунды вернуть обычный текст
            setTimeout(() => {
                storageInfo.innerHTML = '<i class="fas fa-database"></i> Локальное хранилище';
            }, 2000);
        }
    } catch (error) {
        console.error('Ошибка при сохранении в localStorage:', error);
    }
}

/**
 * Загрузка задач из localStorage
 */
function loadTasksFromStorage() {
    try {
        const savedTasks = localStorage.getItem('todoTasks');
        const savedId = localStorage.getItem('todoCurrentId');
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            
            // Восстанавливаем объекты Task
            tasks = tasks.map(taskData => {
                const task = new Task(
                    taskData.id,
                    taskData.title,
                    taskData.description,
                    taskData.date,
                    taskData.completed
                );
                task.createdAt = taskData.createdAt;
                return task;
            });
        }
        
        if (savedId) {
            currentId = parseInt(savedId);
        } else {
            // Если нет сохраненного ID, устанавливаем на основе максимального ID в задачах
            currentId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        }
        
        // Отображение загруженных задач
        renderTasks();
        
        // Показать уведомление о загрузке
        if (tasks.length > 0) {
            showNotification(`Загружено ${tasks.length} задач`, 'info');
        }
    } catch (error) {
        console.error('Ошибка при загрузке из localStorage:', error);
    }
}

/**
 * Показать уведомление
 */
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: #1a1a1a;
        color: white;
        font-size: 14px;
        border: 1px solid #1a1a1a;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Добавляем уведомление на страницу
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Форматирование даты в читаемый вид
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Сравнение дат (без времени)
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) {
        return 'Сегодня';
    } else if (isTomorrow) {
        return 'Завтра';
    } else {
        // Форматирование даты в формате ДД.ММ.ГГГГ
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
}

/**
 * Экранирование HTML-символов для безопасности
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Добавляем CSS для анимации уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);
