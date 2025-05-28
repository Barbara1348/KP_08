/**
 * Выход из профиля
 */
function logOut() {
    const infoUserBtn = document.getElementById("infoUserBtn");
    const myCoursesBtn = document.getElementById("myCoursesBtn");
    const mySertificatesBtn = document.getElementById("mySertificatesBtn");
    const logOutBtn = document.getElementById("logOutBtn");

    myCoursesBtn.classList.remove("active");
    infoUserBtn.classList.remove("active");
    mySertificatesBtn.classList.remove("active");
    logOutBtn.classList.add("active");

    let usersManager = new UsersManager();
    localStorage.removeItem("newCurrentUser");
    window.location.href = "/log/";

}