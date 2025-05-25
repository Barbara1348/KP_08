let userManager = new UsersManager();

const registration = document.getElementById("registration");
const authorization = document.getElementById("authorization");
const loginForm = document.getElementById("loginForm");
const registForm = document.getElementById("registForm");

authorization.addEventListener("click", () => {
    authorization.classList.add("active");
    registration.classList.remove("active");
    registForm.classList.remove("active_");
    loginForm.classList.add("active_");
});

registration.addEventListener("click", () => {
    registration.classList.add("active");
    authorization.classList.remove("active");
    loginForm.classList.remove("active_");
    registForm.classList.add("active_");
});

//форма регистрации

registForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginRegist").value.trim();
    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const password = document.getElementById("passwordRegist").value;
    const confirmPassword = document.getElementById("password_Regist").value;
    const errorElem = document.getElementById("loginError");

    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];

    function Modal() {
        // Закрываем модальное окно при клике на крестик
        span.onclick = function () {
            modal.style.display = "none";
        }

        // Закрываем модальное окно при клике вне его области
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    if (password !== confirmPassword) {
        errorElem.innerText = "Неверное имя пользователя или пароль!";
        modal.style.display = "block";
        Modal();
        return;
    }

    if (userManager.data.find(user => user.username === username)) {
        errorElem.innerText = "Такое имя пользователя уже занято!";
        modal.style.display = "block";
        Modal();
        return;
    }

    else {
        errorElem.innerText = "Вы успешно авторизовались!";
        modal.style.display = "block";
        Modal();
    }

    setTimeout(() => {
        let data = userManager.add(
            surname,
            name,
            username,
            password,
        );
        userManager.setCurrentUser(data.id);
        window.location.href = "/profile/";
    }, 2000)
});

//далее авторизация

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("loginAuth").value.trim();
    const password = document.getElementById("passwordLogin").value;
    const errorElem = document.getElementById("loginError");

    const foundUser = userManager.data.find(user => user.username === username && user.password === password);

    // Получаем элементы
    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];

    function Modal() {
        // Закрываем модальное окно при клике на крестик
        span.onclick = function () {
            modal.style.display = "none";
        }

        // Закрываем модальное окно при клике вне его области
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    if (!foundUser) {
        // Открываем модальное окно при клике на кнопку
        errorElem.innerText = "Неверное имя пользователя или пароль!";
        modal.style.display = "block";
        Modal();
        return;
    }

    else {
        errorElem.innerText = "Вы успешно авторизовались!";
        modal.style.display = "block";
        Modal();
    }

    setTimeout(() => {
        userManager.setCurrentUser(foundUser.id);
        window.location.href = "/profile/";
    }, 2000);
});