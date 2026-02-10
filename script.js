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
    
    const logoIcon = document.createElement('i');
    logoIcon.className = 'fas fa-tasks logo-icon';
    
    const appTitle = document.createElement('h1');
    appTitle.className = 'app-title';
    appTitle.textContent = 'ToDo List';
    
    const appSubtitle = document.createElement('p');
    appSubtitle.className = 'app-subtitle';
    appSubtitle.textContent = ' эффективно';
    
    logoSection.appendChild(logoIcon);
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
    formTitle.textContent = 'Добавить новую задачу';
    
    // Поле ввода названия задачи
    const titleInputContainer = document.createElement('div');
    titleInputContainer.className = 'input-container';
    
    const titleLabel = document.createElement('label');
    titleLabel.className = 'input-label';
    titleLabel.textContent = 'Название задачи';
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
    addButton.className = 'btn btn-primary add-btn';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Добавить задачу';
    
    // Панель фильтров и сортировки
    const filtersPanel = document.createElement('div');
    filtersPanel.className = 'filters-panel';
    
    const filtersTitle = document.createElement('h3');
    filtersTitle.className = 'filters-title';
    filtersTitle.textContent = 'Фильтры и сортировка';
    
    // Поле поиска
    const searchContainer = document.createElement('div');
    searchContainer.className = 'input-container';
    
    const searchLabel = document.createElement('label');
    searchLabel.className = 'input-label';
    searchLabel.textContent = 'Поиск задач';
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
    statusFilterLabel.textContent = 'Фильтр по статусу';
    
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
    sortLabel.textContent = 'Сортировка по дате';
    
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
    resetButton.className = 'btn btn-secondary reset-btn';
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
    taskTitle.textContent = 'Мои задачи';
    
    const taskStats = document.createElement('div');
    taskStats.id = 'task-stats';
    taskStats.className = 'task-stats';
    
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
        <p>Добавьте свою первую задачу, используя форму слева</p>
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
    copyright.innerHTML = '&copy; 2023 ToDo List App. Все права защищены.';
    
    const localStorageInfo = document.createElement('div');
    localStorageInfo.id = 'storage-info';
    localStorageInfo.className = 'storage-info';
    localStorageInfo.innerHTML = '<i class="fas fa-database"></i> Данные сохраняются локально';
    
    footerContent.appendChild(copyright);
    footerContent.appendChild(localStorageInfo);
    
    footer.appendChild(footerContent);
    container.appendChild(footer);
}

// Добавляем стили для модального окна
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    }
    
    .modal-content {
        background-color: white;
        border-radius: 12px;
        padding: 2rem;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease-out;
    }
    
    .modal-content h3 {
        margin-bottom: 1.5rem;
        color: #2d3748;
        font-size: 1.5rem;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        justify-content: flex-end;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(modalStyles);
