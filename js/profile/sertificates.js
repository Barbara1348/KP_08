/**
 * Загрузка сертификатов пользователя (работает с БД)
 */
async function loadSertificates() {
    const infoUserBtn = document.getElementById("infoUserBtn");
    const myCoursesBtn = document.getElementById("myCoursesBtn");
    const mySertificatesBtn = document.getElementById("mySertificatesBtn");
    const logOutBtn = document.getElementById("logOutBtn");

    const courses = document.getElementById("courses");
    const info = document.getElementById("info");
    const sertificates = document.getElementById("sertificates");

    const userManager = new UsersManager();
    const certificatesManager = new CertificatesManager();

    // Активация кнопки
    mySertificatesBtn.classList.add("active");
    infoUserBtn.classList.remove("active");
    myCoursesBtn.classList.remove("active");
    logOutBtn.classList.remove("active");

    // Показываем блок сертификатов
    sertificates.classList.add("active_");
    courses.classList.remove("active_");
    info.classList.remove("active_");

    const container = document.getElementById("certificatesContainer");
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Загрузка сертификатов...</p>
        </div>
    `;
    
    try {
        // Получаем текущего пользователя
        const currentUser = userManager.getCurrentUser();
        if (!currentUser) {
            window.location.href = "/log/";
            return;
        }

        // Получаем сертификаты пользователя через API
        const certificates = await certificatesManager.getUserCertificates(currentUser.id);
        
        let html = '';
        
        if (certificates && certificates.length > 0) {
            certificates.forEach(cert => {
                const issueDate = new Date(cert.issue_date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                
                html += `
                <div class="certificate-card">
                    <div class="certificate-header">
                        <h3>Сертификат о прохождении курса</h3>
                        <p class="certificate-number">№ ${cert.certificate_number}</p>
                    </div>
                    <div class="certificate-body">
                        <p><span>Выдан:</span> <strong>${cert.student_name}</strong></p>
                        <p><span>За успешное прохождение курса:</span> <strong>"${cert.course_name}"</strong></p>
                        <p><span>Уровень:</span> <strong>${cert.level}</strong></p>
                        <p><span>Дата выдачи:</span> <strong>${issueDate}</strong></p>
                    </div>
                </div>
                `;
            });
        } else {
            html = `
            <div class="no-certificates">
                <h5>У вас пока нет сертификатов</h5>
                <p>Завершите курс, чтобы получить сертификат</p>
                <button onclick="loadCourses()" class="download-btn" style="margin-top: 2vw; width: auto;">
                    Перейти к курсам
                </button>
            </div>
            `;
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка при загрузке сертификатов:', error);
        container.innerHTML = `
        <div class="error">
            <h5>Ошибка при загрузке сертификатов</h5>
            <p>${error.message || 'Попробуйте обновить страницу'}</p>
            <button onclick="loadSertificates()" class="download-btn" style="margin-top: 2vw; width: auto;">
                Повторить попытку
            </button>
        </div>
        `;
    }
}