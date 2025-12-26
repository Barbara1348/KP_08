// Инициализация админ-панели
document.addEventListener('DOMContentLoaded', function() {
    console.log('Админ панель загружается...');
    
    // Проверяем права администратора
    const userManager = new UsersManager();
    
    if (!userManager.isAuthenticated()) {
        window.location.href = "/log/";
        return;
    }
    
    if (!userManager.isAdmin()) {
        window.location.href = "/profile/";
        return;
    }
    
    // Инициализация данных
    loadAdminData();
    loadDashboardStats();
    
    // Назначаем обработчики кнопок навигации
    document.getElementById('dashboardBtn').addEventListener('click', switchToDashboard);
    document.getElementById('usersBtn').addEventListener('click', switchToUsers);
    document.getElementById('coursesBtn').addEventListener('click', switchToCourses);
    document.getElementById('statsBtn').addEventListener('click', switchToStats);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('sidebarLogoutBtn').addEventListener('click', logout);
    document.getElementById('refreshUsersBtn').addEventListener('click', refreshUsers);
    document.getElementById('addCourseBtn').addEventListener('click', addCourse);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    
    // Настраиваем поиск
    const searchInput = document.getElementById('searchUsers');
    if (searchInput) {
        searchInput.addEventListener('input', searchUsers);
    }
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('myModal');
        if (modal && event.target == modal) {
            closeModal();
        }
    });
});

/**
 * Загрузка данных администратора
 */
async function loadAdminData() {
    const userManager = new UsersManager();
    const currentUser = userManager.getCurrentUser();
    
    const adminInfo = document.getElementById('adminInfo');
    if (currentUser && adminInfo) {
        adminInfo.innerHTML = `
            <p><strong>Администратор:</strong> ${currentUser.surname} ${currentUser.name}</p>
            <p><strong>Логин:</strong> ${currentUser.username}</p>
        `;
    }
}

/**
 * Переключение на панель управления
 */
function switchToDashboard() {
    setActiveButton('dashboardBtn');
    showSection('dashboardSection');
    loadDashboardStats();
}

/**
 * Переключение на управление пользователями
 */
function switchToUsers() {
    setActiveButton('usersBtn');
    showSection('usersSection');
    loadUsers();
}

/**
 * Переключение на управление курсами
 */
function switchToCourses() {
    setActiveButton('coursesBtn');
    showSection('coursesSection');
    loadCourses();
}

/**
 * Переключение на статистику
 */
function switchToStats() {
    setActiveButton('statsBtn');
    showSection('statsSection');
    loadDetailedStats();
}

/**
 * Установка активной кнопки
 */
function setActiveButton(buttonId) {
    // Убираем активный класс со всех кнопок
    const buttons = document.querySelectorAll('.admin-sidebar button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Добавляем активный класс выбранной кнопке
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

/**
 * Показать выбранную секцию
 */
function showSection(sectionId) {
    // Скрываем все секции
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Показываем выбранную секцию
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active-section');
    }
}

/**
 * Загрузка статистики для панели управления
 */
async function loadDashboardStats() {
    const userManager = new UsersManager();
    
    try {
        const stats = await userManager.getStats();
        const statsGrid = document.getElementById('statsGrid');
        
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h3>${stats.totalUsers}</h3>
                    <p>Пользователей</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.totalCourses}</h3>
                    <p>Курсов</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.totalCertificates}</h3>
                    <p>Сертификатов</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = '<div class="error">Ошибка загрузки статистики</div>';
        }
    }
}

/**
 * Загрузка списка пользователей
 */
async function loadUsers() {
    const userManager = new UsersManager();
    
    try {
        const users = await userManager.getAllUsers();
        const tableBody = document.getElementById('usersTableBody');
        
        if (tableBody) {
            tableBody.innerHTML = '';
            
            if (users.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="error">Нет зарегистрированных пользователей</td>
                    </tr>
                `;
                return;
            }
            
            users.forEach(user => {
                const row = document.createElement('tr');
                const registerDate = new Date(user.created_at).toLocaleDateString('ru-RU');
                const role = user.role ? user.role.name : 'user';
                const courseCount = user.courses ? user.courses.length : 0;
                
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.surname} ${user.name}</td>
                    <td>${user.username}</td>
                    <td><span class="role-badge ${role}">${role === 'admin' ? 'Администратор' : 'Пользователь'}</span></td>
                    <td>${courseCount}</td>
                    <td>${registerDate}</td>
                    <td class="action-buttons">
                        <button class="action-btn view" onclick="viewUserDetails(${user.id})">Просмотр</button>
                        ${role !== 'admin' ? `<button class="action-btn delete" onclick="deleteUser(${user.id})">Удалить</button>` : ''}
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        const tableBody = document.getElementById('usersTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error">Ошибка загрузки пользователей: ${error.message}</td>
                </tr>
            `;
        }
    }
}

/**
 * Загрузка списка курсов
 */
async function loadCourses() {
    const coursesManager = new CoursesManager();
    
    try {
        const courses = await coursesManager.getAllCourses();
        const coursesList = document.getElementById('coursesList');
        
        if (coursesList) {
            coursesList.innerHTML = '';
            
            if (courses.length === 0) {
                coursesList.innerHTML = '<div class="error">Нет доступных курсов</div>';
                return;
            }
            
            courses.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card';
                courseCard.innerHTML = `
                    <h4>${course.name}</h4>
                    <p><strong>Уровень:</strong> ${course.level}</p>
                    <p><strong>ID:</strong> ${course.id}</p>
                    <div style="margin-top: 1vw;">
                        <button class="action-btn edit" onclick="editCourse(${course.id})">Редактировать</button>
                        <button class="action-btn delete" onclick="deleteCourse(${course.id})">Удалить</button>
                    </div>
                `;
                coursesList.appendChild(courseCard);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки курсов:', error);
        const coursesList = document.getElementById('coursesList');
        if (coursesList) {
            coursesList.innerHTML = '<div class="error">Ошибка загрузки курсов</div>';
        }
    }
}

/**
 * Загрузка детальной статистики
 */
async function loadDetailedStats() {
    const userManager = new UsersManager();
    
    try {
        const stats = await userManager.getStats();
        const detailedStats = document.getElementById('detailedStats');
        
        if (detailedStats) {
            detailedStats.innerHTML = `
                <div class="stat-item">
                    <h4>Распределение по ролям</h4>
                    ${stats.usersByRole ? stats.usersByRole.map(role => `
                        <p><strong>${role.role ? role.role.name : 'Неизвестно'}:</strong> ${role.count} пользователей</p>
                    `).join('') : '<p>Нет данных</p>'}
                </div>
                <div class="stat-item">
                    <h4>Популярность курсов</h4>
                    ${stats.popularCourses ? stats.popularCourses.map(course => `
                        <p><strong>${course.name}:</strong> ${course.student_count} студентов</p>
                    `).join('') : '<p>Нет данных</p>'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка загрузки детальной статистики:', error);
        const detailedStats = document.getElementById('detailedStats');
        if (detailedStats) {
            detailedStats.innerHTML = '<div class="error">Ошибка загрузки детальной статистики</div>';
        }
    }
}

/**
 * Поиск пользователей
 */
function searchUsers() {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

/**
 * Обновление списка пользователей
 */
function refreshUsers() {
    loadUsers();
    showModal('Список пользователей обновлен');
}

/**
 * Просмотр деталей пользователя
 */
async function viewUserDetails(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const user = await response.json();
        
        showModal(`
            <h3>Детальная информация о пользователе</h3>
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>ФИО:</strong> ${user.surname} ${user.name}</p>
            <p><strong>Логин:</strong> ${user.username}</p>
            <p><strong>Роль:</strong> ${user.role ? user.role.name : 'user'}</p>
            <p><strong>Дата регистрации:</strong> ${new Date(user.created_at).toLocaleDateString('ru-RU')}</p>
            <p><strong>Курсов:</strong> ${user.courses ? user.courses.length : 0}</p>
            <p><strong>Сертификатов:</strong> ${user.certificates ? user.certificates.length : 0}</p>
        `);
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error);
        showModal('Ошибка загрузки данных пользователя');
    }
}

/**
 * Удаление пользователя
 */
async function deleteUser(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        return;
    }
    
    const userManager = new UsersManager();
    
    try {
        await userManager.deleteUser(userId);
        showModal('Пользователь успешно удален');
        loadUsers();
        loadDashboardStats();
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        showModal(error.message || 'Не удалось удалить пользователя');
    }
}

/**
 * Добавление курса
 */
function addCourse() {
    showModal('Функция добавления курса в разработке');
}

/**
 * Редактирование курса
 */
function editCourse(courseId) {
    showModal(`Редактирование курса #${courseId} в разработке`);
}

/**
 * Удаление курса
 */
function deleteCourse(courseId) {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) {
        return;
    }
    showModal(`Удаление курса #${courseId} в разработке`);
}

/**
 * Показать модальное окно
 */
function showModal(message) {
    const modal = document.getElementById('myModal');
    const modalMessage = document.getElementById('modalMessage');
    
    if (modal && modalMessage) {
        modalMessage.innerHTML = message;
        modal.style.display = 'block';
    }
}

/**
 * Закрыть модальное окно
 */
function closeModal() {
    const modal = document.getElementById('myModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Выход из системы
 */
function logout() {
    const userManager = new UsersManager();
    userManager.logout();
    window.location.href = "/log/";
}

// Экспорт функций для глобального использования
window.switchToDashboard = switchToDashboard;
window.switchToUsers = switchToUsers;
window.switchToCourses = switchToCourses;
window.switchToStats = switchToStats;
window.refreshUsers = refreshUsers;
window.searchUsers = searchUsers;
window.viewUserDetails = viewUserDetails;
window.deleteUser = deleteUser;
window.addCourse = addCourse;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;
window.showModal = showModal;
window.closeModal = closeModal;
window.logout = logout;