/**
 * Функция для проверки авторизации и перенаправления
 */
async function log() {
    let userManager = new UsersManager();
    
    if (userManager.isAuthenticated()) {
        // Проверяем роль пользователя
        if (userManager.isAdmin()) {
            // Если админ, переходим в админ панель
            window.location.href = "/admin/";
        } else {
            // Если обычный пользователь, переходим в профиль
            window.location.href = "/profile/";
        }
    } else {
        // Если не авторизован, переходим на страницу логина
        window.location.href = "/log/";
    }
}

/**
 * Проверка авторизации при загрузке страницы
 * (для страниц, которые требуют авторизации)
 */
async function checkAuth() {
    let userManager = new UsersManager();
    
    if (userManager.isAuthenticated()) {
        return userManager.getCurrentUser();
    }
    return null;
}

/**
 * Проверка прав администратора
 */
async function checkAdminAuth() {
    let userManager = new UsersManager();
    
    if (!userManager.isAuthenticated()) {
        window.location.href = "/log/";
        return null;
    }
    
    if (!userManager.isAdmin()) {
        window.location.href = "/profile/";
        return null;
    }
    
    return userManager.getCurrentUser();
}