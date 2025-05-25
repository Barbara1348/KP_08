/**
 * Добавление курса пользователю
 * @param {number} id курса для добавления
 */
function startCourse(
    id,
) {
    let usersManager = new UsersManager();

    const stateUser = usersManager.readCurrentUser();
    if(!stateUser) throw new Error("Пользователь не авторизован");
    
    let user = new User(stateUser);
    const stateCourse = user.checkCourse(id);

    if(!stateCourse) {
        user.addCourse(id);
        usersManager.edit(user.id, user);
        usersManager.save();
    }
    window.location.href = "/profile/";
}