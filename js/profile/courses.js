/**
 * Загрузка списка курсов пользователя 
 */
function loadCourses() {
    const infoUserBtn = document.getElementById("infoUserBtn");
    const myCoursesBtn = document.getElementById("myCoursesBtn");
    const mySertificatesBtn = document.getElementById("mySertificatesBtn");
    const logOutBtn = document.getElementById("logOutBtn");

    const courses = document.getElementById("courses");
    const info = document.getElementById("info");
    const sertificates = document.getElementById("sertificates");

    let coursesManager = new CoursesManager();
    let usersManager = new UsersManager();

    myCoursesBtn.classList.add("active");
    infoUserBtn.classList.remove("active");
    mySertificatesBtn.classList.remove("active");
    logOutBtn.classList.remove("active");

    const stateUser = usersManager.readCurrentUser();
    if (!stateUser) throw new Error("Пользователь не авторизован");

    let user = new User(stateUser);
    let html = ``;
    let hasCourses = false;

    coursesManager.data.forEach(course => {
        const stateCourse = user.checkCourse(course.id);
       
        if (stateCourse) {
            hasCourses = true;
            courses.classList.add("active_");
            sertificates.classList.remove("active_");
            info.classList.remove("active_");

            html += `
            <div class="slide">
                <h5>${course.name}</h5>
                <img src="${course.image}" alt="${course.name}">
            </div>
            `;
        }
    });

    const app = document.getElementById('app');
    
    // Если нет курсов, показываем сообщение
    if (!hasCourses) {
        courses.classList.add("active_");
        sertificates.classList.remove("active_");
        info.classList.remove("active_");
        
        html = `<h5>У вас пока нет активных курсов</h5>`;
    }

    app.innerHTML = html;
}