// Инициализация админ панели
document.addEventListener('DOMContentLoaded', async () => {
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
    
    // Загружаем данные
    await loadAdminData();
    await loadStats();
    await loadUsers();
    
    // Настраиваем поиск
    setupSearch();
});

/**
 * Загрузка данных администратора
 */
async function loadAdminData() {
    const userManager = new UsersManager();
    const currentUser = userManager.getCurrentUser();
    
    const adminInfo = document.getElementById('adminInfo');
    if (currentUser) {
        adminInfo.innerHTML = `
            <p><strong>Администратор:</strong> ${currentUser.surname} ${currentUser.name}</p>
            <p><strong>Логин:</strong> ${currentUser.username}</p>
        `;
    }
}

/**
 * Загрузка статистики
 */
async function loadStats() {
    const userManager = new UsersManager();
    
    try {
        const stats = await userManager.getStats();
        
        const statsCards = document.getElementById('statsCards');
        statsCards.innerHTML = `
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
            <div class="stat-card">
                <h3>${stats.popularCourses[0] ? stats.popularCourses[0].student_count : 0}</h3>
                <p>Самый популярный курс</p>
            </div>
        `;
        
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        document.getElementById('statsCards').innerHTML = `
            <div class="error">
                <p>Ошибка загрузки статистики</p>
            </div>
        `;
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
        tableBody.innerHTML = '';
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">Нет зарегистрированных пользователей</td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.surname} ${user.name}</td>
                <td>${user.username}</td>
                <td><span class="role-badge ${user.role ? user.role.name : 'user'}">${user.role ? user.role.name : 'user'}</span></td>
                <td>
                    <span class="courses-count">${user.courses ? user.courses.length : 0}</span>
                    ${user.courses && user.courses.length > 0 ? 
                        `<button class="action-btn view" onclick="showUserCourses(${user.id})">Просмотр</button>` : 
                        ''}
                </td>
                <td>${new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td class="action-buttons">
                    ${user.role && user.role.name !== 'admin' ? 
                        `<button class="action-btn delete" onclick="deleteUser(${user.id}, '${user.surname} ${user.name}')">Удалить</button>` : 
                        '<span style="color: #7f8c8d;">Нет действий</span>'}
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        document.getElementById('usersTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="error">Ошибка загрузки пользователей</td>
            </tr>
        `;
    }
}

/**
 * Показать курсы пользователя
 */
async function showUserCourses(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/courses`);
        const courses = await response.json();
        
        let coursesHtml = '';
        if (courses.length > 0) {
            courses.forEach(course => {
                const enrolledDate = course.UserCourse ? 
                    new Date(course.UserCourse.enrolled_date).toLocaleDateString('ru-RU') : 
                    'Неизвестно';
                
                coursesHtml += `
                <div class="course-item">
                    <strong>${course.name}</strong>
                    <p>Уровень: ${course.level}</p>
                    <p>Записан: ${enrolledDate}</p>
                </div>
                `;
            });
        } else {
            coursesHtml = '<p>Пользователь не записан ни на один курс</p>';
        }
        
        showModal(`Курсы пользователя #${userId}`, coursesHtml);
        
    } catch (error) {
        console.error('Ошибка получения курсов пользователя:', error);
        showModal('Ошибка', 'Не удалось загрузить курсы пользователя');
    }
}

/**
 * Удаление пользователя
 */
async function deleteUser(userId, userName) {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
        return;
    }
    
    const userManager = new UsersManager();
    
    try {
        await userManager.deleteUser(userId);
        showModal('Успех', `Пользователь "${userName}" успешно удален`);
        await loadUsers(); // Обновляем список
        await loadStats(); // Обновляем статистику
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        showModal('Ошибка', error.message || 'Не удалось удалить пользователя');
    }
}

/**
 * Обновление списка пользователей
 */
async function refreshUsers() {
    await loadUsers();
    await loadStats();
    showModal('Обновлено', 'Список пользователей обновлен');
}

/**
 * Настройка поиска пользователей
 */
function setupSearch() {
    const searchInput = document.getElementById('searchUsers');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#usersTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

/**
 * Выход из системы
 */
function logout() {
    const userManager = new UsersManager();
    userManager.logout();
    window.location.href = "/log/";
}

/**
 * Показать модальное окно
 */
function showModal(title, content) {
    const modal = document.getElementById('myModal');
    const modalMessage = document.getElementById('modalMessage');
    
    modalMessage.innerHTML = `<h3>${title}</h3>${content}`;
    modal.style.display = 'block';
}

/**
 * Закрыть модальное окно
 */
function closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}