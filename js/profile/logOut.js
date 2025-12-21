/**
 * Выход из системы
 */
function logOut() {
    let userManager = new UsersManager();
    userManager.logout();
    window.location.href = "/log/";
}