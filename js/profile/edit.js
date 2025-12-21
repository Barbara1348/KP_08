/**
 * Редактирование профиля пользователя
 */
async function edit() {
    event.preventDefault();
    
    let userManager = new UsersManager();
    
    const surname = document.getElementById("surname").value.trim();
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) {
        showModalError("Пользователь не авторизован");
        return;
    }
    
    try {
        const userData = {
            surname,
            name,
            username
        };
        
        // Добавляем пароль только если он был изменен
        if (password) {
            userData.password = password;
        }
        
        await userManager.edit(currentUser.id, userData);
        
        showModalError("Данные успешно обновлены!");
        
    } catch (error) {
        console.error('Ошибка при обновлении данных:', error);
        showModalError(error.message || "Ошибка при обновлении данных");
    }
}