/**
 * Загрузка списка сертификатов пользователя
 */
function loadSertificates() {
    const infoUserBtn = document.getElementById("infoUserBtn");
    const myCoursesBtn = document.getElementById("myCoursesBtn");
    const mySertificatesBtn = document.getElementById("mySertificatesBtn");
    const logOutBtn = document.getElementById("logOutBtn");
    const courses = document.getElementById("courses");
    const info = document.getElementById("info");
    const sertificates = document.getElementById("sertificates");

    myCoursesBtn.classList.remove("active");
    infoUserBtn.classList.remove("active");
    mySertificatesBtn.classList.add("active");
    logOutBtn.classList.remove("active");

    courses.classList.remove("active_");
    sertificates.classList.add("active_");
    info.classList.remove("active_");
}