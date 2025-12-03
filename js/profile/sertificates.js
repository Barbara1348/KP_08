/**
 * Загрузка сертификатов пользователя
 */
function loadSertificates() {
    const infoUserBtn = document.getElementById("infoUserBtn");
    const myCoursesBtn = document.getElementById("myCoursesBtn");
    const mySertificatesBtn = document.getElementById("mySertificatesBtn");
    const logOutBtn = document.getElementById("logOutBtn");

    const courses = document.getElementById("courses");
    const info = document.getElementById("info");
    const sertificates = document.getElementById("sertificates");

    myCoursesBtn.classList.remove("active");
    infoUserBtn.classList.remove("active");
    mySertificatesBtn.classList.add("active");
    logOutBtn.classList.remove("active");

    courses.classList.remove("active_");
    info.classList.remove("active_");
    sertificates.classList.add("active_");

    let usersManager = new UsersManager();
    let certificatesManager = new CertificatesManager();

    const stateUser = usersManager.readCurrentUser();
    if (!stateUser) throw new Error("Пользователь не авторизован");

    const userCertificates = certificatesManager.getUserCertificates(stateUser.id);
    const container = document.getElementById('certificatesContainer');
    
    if (userCertificates.length === 0) {
        container.innerHTML = '<h5 class="no-certificates">У вас пока нет сертификатов</h5>';
        return;
    }

    let html = '';
    userCertificates.forEach(certificate => {
        html += `
            <div class="certificate" id="certificate-${certificate.id}">
                <div class="certificate-header">
                    <div class="certificate-title">СЕРТИФИКАТ</div>
                    <div class="certificate-subtitle">о прохождении курса</div>
                </div>
                
                <div class="certificate-body">
                    <div class="certificate-text">Настоящим удостоверяется, что</div>
                    <div class="certificate-student-name">${certificate.studentName}</div>
                    <div class="certificate-text">успешно завершил(а) курс</div>
                    <div class="certificate-course-name">«${certificate.courseName}»</div>
                    <div class="certificate-text">
                        Уровень: ${certificate.level}
                    </div>
                </div>
                
                <div class="certificate-footer">
                    <div class="certificate-date">Дата выдачи: ${certificate.issueDate}</div>
                    <div class="certificate-date">Подпись руководителя: 
                    <img src="/assets/images/Union.svg" alt="">
                    </div>
                </div>
                
                <div class="certificate-actions">
                    <button class="download-certificate-btn" onclick="downloadCertificate('${certificate.id}')">
                        Скачать PDF
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}


/**
 * Скачать сертификат в формате PDF
 * @param {string} certificateId ID сертификата
 */
async function downloadCertificate(certificateId) {
    try {
        const certificatesManager = new CertificatesManager();
        const certificate = certificatesManager.data.find(c => c.id === certificateId);
        
        if (!certificate) {
            throw new Error("Сертификат не найден");
        }

        // Показываем индикатор загрузки
        const downloadBtn = document.querySelector(`#certificate-${certificateId} .download-certificate-btn`);
        const originalText = downloadBtn.textContent;
        downloadBtn.disabled = true;

        // Создаем скрытый элемент сертификата без кнопки
        const pdfElement = document.createElement('div');
        pdfElement.className = 'certificate-pdf'; 
        pdfElement.style.position = 'absolute';
        pdfElement.style.left = '-9999px';
        pdfElement.style.top = '0';
        pdfElement.style.boxSizing = 'border-box';

        // Заполняем содержимое сертификата без кнопки
        pdfElement.innerHTML = `
            <div class="certificate" >
                <div class="certificate-header">
                    <div class="certificate-title">СЕРТИФИКАТ</div>
                    <div class="certificate-subtitle">о прохождении курса</div>
                </div>
                
                <div class="certificate-body">
                    <div class="certificate-text">Настоящим удостоверяется, что</div>
                    <div class="certificate-student-name">${certificate.studentName}</div>
                    <div class="certificate-text">успешно завершил(а) курс</div>
                    <div class="certificate-course-name">«${certificate.courseName}»</div>
                    <div class="certificate-text">
                        Уровень: ${certificate.level}
                    </div>
                </div>
                
                <div class="certificate-footer">
                    <div class="certificate-date">Дата выдачи: ${certificate.issueDate}</div>
                    <div class="certificate-date">Подпись руководителя: 
                    <img src="/assets/images/Union.svg" alt="">
                    </div>
                </div>
            </div>
        `;

        // Временно добавляем в DOM
        document.body.appendChild(pdfElement);

        // Ждем немного чтобы стили применились
        await new Promise(resolve => setTimeout(resolve, 100));

        // Создаем canvas из элемента
        const canvas = await html2canvas(pdfElement, {
            scale: 3, // Увеличиваем качество для PDF
            useCORS: true,
            logging: false,
        });

        // Удаляем временный элемент
        document.body.removeChild(pdfElement);

        // Создаем PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Рассчитываем размеры для A4 - ЗАМЕНИТЬ на полный размер
        const imgWidth = 210; // A4 width in mm
        const imgHeight = 297; // ← ИЗМЕНИТЬ: A4 height in mm (полный размер)
        
        // Добавляем изображение на всю страницу - ЗАМЕНИТЬ параметры
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight); // ← ИЗМЕНИТЬ: полный размер
        
        // Генерируем имя файла
        const fileName = `Сертификат_${certificate.courseName}_${certificate.studentName}.pdf`
            .replace(/[^a-zA-Z0-9а-яА-ЯёЁ_\s]/g, '')
            .replace(/\s+/g, '_');
        
        // Сохраняем PDF
        pdf.save(fileName);

        // Восстанавливаем кнопку
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;

    } catch (error) {
        console.error('Ошибка при создании PDF:', error);
        showModalError('Произошла ошибка при создании PDF файла');
        
        // Восстанавливаем кнопку в случае ошибки
        const downloadBtn = document.querySelector(`#certificate-${certificateId} .download-certificate-btn`);
        if (downloadBtn) {
            downloadBtn.textContent = 'Скачать PDF';
            downloadBtn.disabled = false;
        }
    }
}