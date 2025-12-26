/**
 * Функция для редактирования профиля
 */
function edit() {
    // Предотвращаем стандартное поведение формы
    if (event) event.preventDefault();
    
    const form = document.getElementById("formProfile");
    const surname = document.getElementById("surname").value.trim();
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    
    // Валидация
    if (!surname || !name || !username) {
        showModal('Все поля обязательны для заполнения');
        return false;
    }
    
    const usersManager = new UsersManager();
    const currentUser = usersManager.getCurrentUser();
    
    if (!currentUser) {
        showModal('Требуется авторизация');
        window.location.href = "/log/";
        return false;
    }
    
    // Подготавливаем данные для отправки
    const updateData = {
        surname,
        name,
        username
    };
    
    // Отправляем запрос на обновление
    fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Обновляем данные в localStorage
            const updatedUser = {
                ...currentUser,
                surname: data.user.surname,
                name: data.user.name,
                username: data.user.username
            };
            
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            // Обновляем отображение имени
            updateProfileDisplay(updatedUser);
            
            showModal('Данные успешно обновлены!');
            
            // Очищаем поле пароля после успешного обновления
            document.getElementById("password").value = '';
        } else {
            showModal(data.error || 'Ошибка обновления данных');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showModal('Ошибка при обновлении данных');
    });
    
    return false;
}

/**
 * Обновление отображения профиля пользователя
 */
function updateProfileDisplay(userData) {
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = `${userData.surname} ${userData.name}`;
    }
}

/**
 * Показать модальное окно с сообщением
 */
function showModal(message) {
    const modal = document.getElementById("myModal");
    const errorText = document.getElementById("loginError");
    
    if (modal && errorText) {
        errorText.textContent = message;
        modal.style.display = "block";
        
        // Добавляем обработчик для закрытия
        const closeBtn = modal.querySelector(".close");
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = "none";
            }
        }
        
        // Закрытие при клике вне окна
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } else {
        alert(message);
    }
}

// Назначаем обработчик события для формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById("formProfile");
    if (form) {
        // Удаляем старый обработчик onclick с кнопки
        const editBtn = document.getElementById("editBtn");
        if (editBtn) {
            editBtn.onclick = null;
            editBtn.addEventListener('click', function(e) {
                e.preventDefault();
                edit();
            });
        }
        
        // Также добавляем обработчик на саму форму
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            edit();
        });
    }
});