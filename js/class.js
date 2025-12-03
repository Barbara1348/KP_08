/**
 * Менеджер пользователей
 */
class UsersManager {
    constructor(){
        const data = localStorage.getItem("newUsers");
        /**
         * Массив пользователей
         * @type {Array<User>}
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
     * Добавление курса
     * @param {number} id курса для добавления
    */
    addCourse(
        id,
    ) {
        this.IDcourses.push(id);
    }

    /**
     * Проверка наличия курса
     * @param {number} id курса для проверки
     * @returns {boolean}
    */
    checkCourse(
        id,
    ) {
        return this.IDcourses.some(item => item === id);
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





class CoursesManager {
    constructor() {
        this.data = [
            {
                "id": 0,
                "name": "Revit",
                "image": "/assets/images/revit.svg",
                "level": "Продвинутый"
            },
            {
                "id": 1,
                "name": "3D's Max & Corona Render",
                "image": "/assets/images/3Ds_Max_Corona_Render.svg",
                "level": "Профессиональный"
            },
            {
                "id": 2,
                "name": "SketchUp",
                "image": "/assets/images/SketchUp.svg",
                "level": "Базовый"
            },
            {
                "id": 3,
                "name": "Blender",
                "image": "/assets/images/blender.svg",
                "level": "Продвинутый"
            },
            {
                "id": 4,
                "name": "ArchiCAD",
                "image": "/assets/images/archiCAD.svg",
                "level": "Профессиональный"
            },
        ];
    }
}



/**
 * Менеджер сертификатов
 */
class CertificatesManager {
    constructor() {
        const data = localStorage.getItem("userCertificates");
        this.data = data ? JSON.parse(data) : [];
    }

    /**
     * Создание сертификата
     * @param {number} userId ID пользователя
     * @param {number} courseId ID курса
     * @param {string} courseName Название курса
     * @param {string} studentName Имя студента
     * @returns {Object}
     */
    createCertificate(userId, courseId, courseName, studentName) {
        const certificate = {
            id: this.data.length +1,
            userId: userId,
            courseId: courseId,
            courseName: courseName,
            studentName: studentName,
            issueDate: new Date().toLocaleDateString('ru-RU'),
            level: this.getCourseLevel(courseId)
        };
        
        this.data.push(certificate);
        this.save();
        return certificate;
    }


    /**
     * Получение уровня курса
     * @param {number} courseId 
     * @returns {string}
     */
    getCourseLevel(courseId) {
        const coursesManager = new CoursesManager();
        const course = coursesManager.data.find(c => c.id === courseId);
        return course ? course.level : "Не указано";
    }

    /**
     * Получение сертификатов пользователя
     * @param {number} userId 
     * @returns {Array}
     */
    getUserCertificates(userId) {
        return this.data.filter(cert => cert.userId == userId);
    }

    /**
     * Проверка наличия сертификата для курса
     * @param {number} userId 
     * @param {number} courseId 
     * @returns {boolean}
     */
    hasCertificate(userId, courseId) {
        return this.data.some(cert => cert.userId == userId && cert.courseId == courseId);
    }

    /**
     * Сохранение данных
     */
    save() {
        localStorage.setItem("userCertificates", JSON.stringify(this.data));
    }
}