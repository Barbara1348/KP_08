let userManager = new UsersManager();

const registration = document.getElementById("registration");
const authorization = document.getElementById("authorization");
const loginForm = document.getElementById("loginForm");
const registForm = document.getElementById("registForm");

// Переключение между формами
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

// Форма регистрации
registForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("loginRegist").value.trim();
    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const password = document.getElementById("passwordRegist").value;
    const confirmPassword = document.getElementById("password_Regist").value;
    const checkbox = document.getElementById("checkbox");
    
    const errorElem = document.getElementById("loginError");
    const modal = document.getElementById("myModal");

    // Валидация
    if (password !== confirmPassword) {
        showModal("Пароли не совпадают!");
        return;
    }

    if (!checkbox.checked) {
        showModal("Примите пользовательское соглашение!");
        return;
    }

    if (password.length < 6) {
        showModal("Пароль должен содержать минимум 6 символов!");
        return;
    }

    try {
        // Регистрация через API
        await userManager.add(surname, name, username, password);
        
        showModal("Регистрация успешна! Перенаправление...");
        
        setTimeout(() => {
            window.location.href = "/profile/";
        }, 1500);
        
    } catch (error) {
        showModal(error.message || "Ошибка при регистрации");
    }
});

// Форма авторизации
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginAuth").value.trim();
    const password = document.getElementById("passwordLogin").value;

    try {
        // Авторизация через API
        await userManager.setCurrentUser(username, password);
        
        showModal("Авторизация успешна! Перенаправление...");
        
        setTimeout(() => {
            window.location.href = "/profile/";
        }, 1500);
        
    } catch (error) {
        showModal(error.message || "Неверное имя пользователя или пароль!");
    }
});

// Функция показа модального окна (добавьте если ее нет)
function showModal(message) {
    const modal = document.getElementById("myModal");
    const errorText = document.getElementById("loginError");
    
    if (modal && errorText) {
        errorText.textContent = message;
        modal.style.display = "block";
        
        const closeBtn = modal.querySelector(".close");
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = "none";
            }
        }
        
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } else {
        alert(message);
    }
}