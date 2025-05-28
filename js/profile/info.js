/**
 * Загрузка информации о пользователе
 */
function loadInfo() {
    const infoUserBtn = document.getElementById("infoUserBtn");
    const myCoursesBtn = document.getElementById("myCoursesBtn");
    const mySertificatesBtn = document.getElementById("mySertificatesBtn");
    const logOutBtn = document.getElementById("logOutBtn");
    const courses = document.getElementById("courses");
    const info = document.getElementById("info");
    const sertificates = document.getElementById("sertificates");

    myCoursesBtn.classList.remove("active");
    infoUserBtn.classList.add("active");
    mySertificatesBtn.classList.remove("active");
    logOutBtn.classList.remove("active");

    info.classList.add("active_");
    courses.classList.remove("active_");
    sertificates.classList.remove("active_");

    let usersManager = new UsersManager();
    const stateUser = usersManager.readCurrentUser();
    console.log(stateUser);
    if (!stateUser) throw new Error("Пользователь не авторизован");

    const form = document.getElementById("formProfile");
    form.surname.value = stateUser.surname;
    form.name.value = stateUser.name;
    form.login.value = stateUser.username;
    form.password.value = stateUser.password;
}