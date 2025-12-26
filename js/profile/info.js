/**
 * Загрузка информации о пользователе
 */
async function loadInfo() {
    console.log('Загрузка информации о пользователе...');
    
    const infoUserBtn = document.getElementById("infoUserBtn");
    const myCoursesBtn = document.getElementById("myCoursesBtn");
    const mySertificatesBtn = document.getElementById("mySertificatesBtn");
    const logOutBtn = document.getElementById("logOutBtn");
    const courses = document.getElementById("courses");
    const info = document.getElementById("info");
    const sertificates = document.getElementById("sertificates");

    // Устанавливаем активные классы
    myCoursesBtn.classList.remove("active");
    infoUserBtn.classList.add("active");
    mySertificatesBtn.classList.remove("active");
    logOutBtn.classList.remove("active");

    info.classList.add("active_");
    courses.classList.remove("active_");
    sertificates.classList.remove("active_");

    let usersManager = new UsersManager();
    const stateUser = usersManager.getCurrentUser();
    console.log('Текущий пользователь из localStorage:', stateUser);
    
    // Проверка авторизации
    if (!stateUser) {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        window.location.href = "/log/";
        return;
    }

    try {
        // Получаем актуальные данные пользователя из БД через API
        console.log('Запрашиваем данные пользователя из БД, ID:', stateUser.id);
        const response = await fetch(`/api/users/${stateUser.id}`);
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 404) {
                // Если пользователь не найден или нет доступа, перенаправляем на логин
                usersManager.logout();
                window.location.href = "/log/";
                return;
            }
            throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('Данные пользователя из БД:', userData);
        
        // Заполняем форму данными пользователя
        const form = document.getElementById("formProfile");
        if (form) {
            document.getElementById("surname").value = userData.surname || '';
            document.getElementById("name").value = userData.name || '';
            document.getElementById("username").value = userData.username || '';
            
            // Обновляем данные в localStorage
            const updatedUser = {
                id: userData.id,
                surname: userData.surname,
                name: userData.name,
                username: userData.username,
                role: userData.role ? (userData.role.name || userData.role) : 'user',
                created_at: userData.created_at
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            console.log('Данные обновлены в localStorage:', updatedUser);
        }
        
        // Обновляем отображение имени в профиле
        updateProfileDisplay(userData);
        
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        
        // Если ошибка сети или сервера, показываем данные из localStorage
        const form = document.getElementById("formProfile");
        if (form && stateUser) {
            document.getElementById("surname").value = stateUser.surname || '';
            document.getElementById("name").value = stateUser.name || '';
            document.getElementById("username").value = stateUser.username || '';
            document.getElementById("password").value = '';
            
            showNotification('Используются сохраненные данные. Невозможно подключиться к серверу.', 'warning');
        }
    }
}

/**
 * Обновление отображения профиля пользователя
 */
function updateProfileDisplay(userData) {
    // Обновляем аватар или приветствие, если есть соответствующие элементы
    const welcomeText = document.querySelector('.welcome-text');
    
    if (welcomeText) {
        welcomeText.textContent = `Добро пожаловать, ${userData.surname} ${userData.name}!`;
    }
    
    // Добавляем отображение имени рядом с аватаром
    const profileSection = document.querySelector('.profile');
    if (profileSection && !profileSection.querySelector('.user-name')) {
        const userName = document.createElement('div');
        userName.className = 'user-name';
        userName.textContent = `${userData.surname} ${userData.name}`;
        userName.style.cssText = `
            margin-top: 10px;
            font-weight: 600;
            font-size: 1.1rem;
            color: #333;
            text-align: center;
        `;
        profileSection.appendChild(userName);
    }
}

/**
 * Показать уведомление
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        min-width: 300px;
        max-width: 400px;
    `;
    
    // Цвета в зависимости от типа
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ff9800';
    } else {
        notification.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Автоматически загружаем информацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница профиля загружена');
    
    // Проверяем авторизацию при загрузке
    const usersManager = new UsersManager();
    if (!usersManager.isAuthenticated()) {
        window.location.href = "/log/";
        return;
    }
    
    // Загружаем информацию о пользователе
    loadInfo();
    
    // Добавляем стили для анимации уведомлений
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});