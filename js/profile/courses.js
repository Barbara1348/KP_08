/**
 * Загрузка списка курсов пользователя (работает с БД)
 */
async function loadCourses() {
    const infoUserBtn = document.getElementById("infoUserBtn");
    const myCoursesBtn = document.getElementById("myCoursesBtn");
    const mySertificatesBtn = document.getElementById("mySertificatesBtn");
    const logOutBtn = document.getElementById("logOutBtn");

    const courses = document.getElementById("courses");
    const info = document.getElementById("info");
    const sertificates = document.getElementById("sertificates");

    const userManager = new UsersManager();
    const coursesManager = new CoursesManager();

    // Активация кнопки
    myCoursesBtn.classList.add("active");
    infoUserBtn.classList.remove("active");
    mySertificatesBtn.classList.remove("active");
    logOutBtn.classList.remove("active");

    // Показываем блок курсов
    courses.classList.add("active_");
    sertificates.classList.remove("active_");
    info.classList.remove("active_");

    const app = document.getElementById('app');
    app.innerHTML = '<div class="loading">Загрузка курсов...</div>';
    
    try {
        // Получаем текущего пользователя
        const currentUser = userManager.getCurrentUser();
        if (!currentUser) {
            window.location.href = "/log/";
            return;
        }

        // Получаем курсы пользователя через API
        const userCourses = await coursesManager.getUserCourses(currentUser.id);
        
        let html = '';
        
        if (userCourses && userCourses.length > 0) {
            userCourses.forEach(course => {
                html += `
                <div class="slide">
                    <h5>${course.name}</h5>
                    <img src="${course.image}" alt="${course.name}">
                    <p class="course-level">Уровень: ${course.level}</p>
                </div>
                `;
            });
        } else {
            html = `
            <div class="no-courses">
                <h5>У вас пока нет активных курсов</h5>
                <p>Перейдите в <a href="/index.html#section2">каталог курсов</a> чтобы начать обучение</p>
            </div>
            `;
        }
        
        app.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка при загрузке курсов:', error);
        app.innerHTML = `
        <div class="error">
            <h5>Ошибка при загрузке курсов</h5>
            <p>${error.message}</p>
            <p>Попробуйте обновить страницу</p>
        </div>
        `;
    }
}

// Альтернативное имя для кнопки
function showMyCourses() {
    loadCourses();
}