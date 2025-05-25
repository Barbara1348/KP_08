/**
 * Загрузка списка курсов пользователя 
 */
function loadCourses() {
    let coursesManager = new CoursesManager();
    let usersManager = new UsersManager();

    const stateUser = usersManager.readCurrentUser();
    if (!stateUser) throw new Error("Пользователь не авторизован");

    let user = new User(stateUser);
    let html = ``;

    coursesManager.data.forEach(course => {
        const stateCourse = user.checkCourse(course.id);
        if (stateCourse) html += `
            <div>
                <p>${course.name}</p>
            </div>
        `;
    });

    const app = document.getElementById('app');
    app.innerHTML = html;
}