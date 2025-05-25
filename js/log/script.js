document.addEventListener("DOMContentLoaded", () => {
    let users = JSON.parse(localStorage.getItem("users")) || [
        { userID: 1, username: "testuser", name: "name", surname: "surname", password: btoa("password123") }
    ];
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
        if (document.getElementById("welcomeMessage")) {
            document.getElementById("welcomeMessage").innerText = (` Добро пожаловать, ${currentUser.username}!`);
        }
    }

    const registration = document.getElementById("registration");
    const authorization = document.getElementById("authorization");
    const loginForm = document.getElementById("loginForm");
    const registForm = document.getElementById("registForm");

    authorization.classList.add("active");
    loginForm.classList.add("active_");

    registForm.style.transition = "transform 0.5s ease";
    loginForm.style.transition = "transform 0.5s ease";

    authorization.addEventListener("click", () => {

        setTimeout(() => {
            authorization.classList.add("active");
            registration.classList.remove("active");
            registForm.classList.remove("active_");
            loginForm.classList.add("active_");
        }, 10);
    });

    registration.addEventListener("click", () => {


        setTimeout(() => {
            registration.classList.add("active");
            authorization.classList.remove("active");
            loginForm.classList.remove("active_");
            registForm.classList.add("active_");
        }, 10);
    });

    //форма регистрации

    if (registForm) {
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

            if (users.find(user => user.username === username)) {
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
                const newUser = { userID: users.length + 1, username, name, surname, password: btoa(password) };
                users.push(newUser);
                localStorage.setItem("users", JSON.stringify(users));
                localStorage.setItem("currentUser", JSON.stringify(newUser));
                window.location.href = "profile.html";
            }, 2000)
        });
    }

    //далее авторизация

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = document.getElementById("loginAuth").value.trim();
            const password = document.getElementById("passwordLogin").value;
            const errorElem = document.getElementById("loginError");

            const foundUser = users.find(user => user.username === username && user.password === btoa(password));

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
                localStorage.setItem("currentUser", JSON.stringify(foundUser));
                window.location.href = "profile.html";
            }, 2000);

        });
    }
});