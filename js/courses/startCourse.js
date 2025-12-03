/**
 * Добавление курса пользователю
 * @param {number} id курса для добавления
 */
function startCourse(id) {
    let usersManager = new UsersManager();
    let certificatesManager = new CertificatesManager();
    let coursesManager = new CoursesManager();

    const stateUser = usersManager.readCurrentUser();
    
    if (!stateUser) {
        showModalError("Пользователь не авторизован");
        return;
    }
    
    let user = new User(stateUser);
    const stateCourse = user.checkCourse(id);

    if (!stateCourse) {
        user.addCourse(id);
        usersManager.edit(user.id, user);
        usersManager.save();
        
        // Создаем сертификат при добавлении курса
        const course = coursesManager.data.find(c => c.id === id);
        if (course) {
            certificatesManager.createCertificate(
                user.id, 
                course.id, 
                course.name, 
                `${user.surname} ${user.name}`
            );
        }
    }
    window.location.href = "/profile/";
}

/**
 * Показать ошибку в модальном окне
 * @param {string} message Сообщение об ошибке
 */
function showModalError(message) {
    const modal = document.getElementById("myModal");
    const errorText = document.getElementById("loginError");
    
    if (modal && errorText) {
        errorText.textContent = message;
        modal.style.display = "block";
        
        // Добавляем обработчик для закрытия модального окна
        const closeBtn = modal.querySelector(".close");
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = "none";
            }
        }
        
        // Закрытие модального окна при клике вне его
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } else {
        // Если модальное окно не найдено, показываем alert
        alert(message);
    }
}

/**
 * Закрыть модальное окно
 */
function closeModal() {
    const modal = document.getElementById("myModal");
    if (modal) {
        modal.style.display = "none";
    }
}