/**
 * Менеджер пользователей
 */
class UsersManager {
    constructor(){
        const data = localStorage.getItem("newUsers");
        /**
         * Массив пользователей
         * @type {Array}
         */
        this.data = data ? JSON.parse(data) : [];
    }

    /**
     * Добавление нового пользователя
     * @param {string} surname фамилия
     * @param {string} name имя
     * @param {string} username логин
     * @param {string} password пароль
     * @returns {User}
     */
    add(
        surname,
        name, 
        username, 
        password,
    ){
        const user = {
            "id": this.data.length + 1,
            "surname": surname,
            "name": name,
            "username": username,
            "password": password,
            "IDcourses": [],
        }
        this.data.push(user);
        this.save();
        return user;
    }

    /**
     * Изменение данных пользователя
     * @param {number} id пользователя для изменений
     * @param {User} data данные пользователя 
     */
    edit (
        id,
        data,
    ) {
        this.data[id-1] = data;
        this.save();
    }

    /**
     * Получение текущего пользователя
     * @return {number | null}
     */
    getCurrentUser (){
        return localStorage.getItem("newCurrentUser");
    }

    /**
     * Получение данных текущего пользователя
     * @returns {User | null}
     */
    readCurrentUser(){
        const id = this.getCurrentUser();
        if (id) return this.readId(id);
        else return null;
    }

    /**
     * Получение данных пользователя по ID пользователя
     * @param {number} id нужного пользователя
     * @returns {User | null}
     */
    readId(
        id,
    ){
        const data = this.data.find(item => item.id == id);
        return data; 
    }

    /**
     * Сохранение данных
     */
    save(){
        localStorage.setItem("newUsers", JSON.stringify(this.data));
    }

    /**
     * Установка текущего пользователя
     * @param {number} id 
     */
    setCurrentUser (
        id,
    ){
        localStorage.setItem("newCurrentUser", JSON.stringify(id));
    }

    /**
     * Вывод данных пользователей в консоль
     */
    console(){
        console.table(this.data);
    }
};





/**
 * Класс по работе с пользователем
 * @param {User} данные пользователя
 */
class User {
    constructor(data){
        /**
         * Id
         * @type {number}
         */
        this.id = data.id;
         /**
         * Фамилия
         * @type {string}
         */
        this.surname = data.surname;
        /**
         * Имя
         * @type {string}
         */
        this.name = data.name;
        /**
         * Логин
         * @type {string}
         */
        this.username = data.username;
        /**
         * Пароль
         * @type {string}
         */
        this.password = data.password;
        /**
         * ID курсов
         * @type {[number]}
         */
        this.IDcourses = data.IDcourses;
    }

    /**
     * Вывод данных пользователя в консоль
     */
    console(){
        console.table(
            {
                "id": this.id,
                "surname": this.surname,
                "name": this.name,
                "username": this.username,
                "password": this.password,
                "IDcourses": this.IDcourses,
            }
        )
    }
};