/**
 * Добавление курса пользователю (работает с БД)
 */
async function startCourse(courseId) {
    try {
        // Проверяем авторизацию
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) {
            alert("Пожалуйста, войдите в систему");
            setTimeout(() => {
                window.location.href = "/log/";
            }, 1000);
            return;
        }
        
        const currentUser = JSON.parse(userJson);
        const coursesManager = new CoursesManager();
        
        // Проверяем, не записан ли уже на курс
        const enrollment = await coursesManager.checkUserEnrollment(currentUser.id, courseId);
        
        if (enrollment.isEnrolled) {
            alert("Вы уже записаны на этот курс");
            setTimeout(() => {
                window.location.href = "/profile/";
            }, 1500);
            return;
        }
        
        // Добавляем курс через API
        await coursesManager.addCourseToUser(currentUser.id, courseId);
        
        alert("Курс успешно добавлен! Сертификат создан.");
        
        setTimeout(() => {
            window.location.href = "/profile/";
        }, 1500);
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert("Ошибка при добавлении курса: " + error.message);
    }
}

/**
 * Показать модальное окно
 */
function showModalError(message) {
    const modal = document.getElementById("myModal");
    const errorText = document.getElementById("loginError");
    
    if (modal && errorText) {
        errorText.textContent = message;
        modal.style.display = "block";
        
        const closeBtn = modal.querySelector(".close");
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = "none";
            }
        }
        
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } else {
        alert(message);
    }
}