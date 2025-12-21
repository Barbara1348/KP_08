const express = require('express');
const cors = require('cors');
const path = require('path');

// Импортируем модели из единого файла
const { sequelize, Role, User, Course, Certificate, UserCourse } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ========== API ROUTES ==========

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  try {
    const { surname, name, username, password } = req.body;
    
    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }
    
    // Создаем пользователя с ролью "user" по умолчанию
    const user = await User.create({
      surname,
      name,
      username,
      password,
      role_id: 2 // ID роли "user"
    });
    
    // Получаем данные пользователя с ролью
    const userWithRole = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });
    
    // Возвращаем данные пользователя без пароля
    const userResponse = {
      id: userWithRole.id,
      surname: userWithRole.surname,
      name: userWithRole.name,
      username: userWithRole.username,
      role: userWithRole.role ? userWithRole.role.name : 'user',
      created_at: userWithRole.created_at
    };
    
    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
  }
});

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Ищем пользователя с ролью
    const user = await User.findOne({ 
      where: { username },
      include: [{
        model: Role,
        as: 'role'
      }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    // Проверяем пароль
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    // Возвращаем данные пользователя без пароля
    const userResponse = {
      id: user.id,
      surname: user.surname,
      name: user.name,
      username: user.username,
      role: user.role ? user.role.name : 'user',
      created_at: user.created_at
    };
    
    res.json({
      success: true,
      message: 'Авторизация успешна',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Ошибка при авторизации' });
  }
});

// Получение всех курсов
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error) {
    console.error('Ошибка получения курсов:', error);
    res.status(500).json({ error: 'Ошибка при получении курсов' });
  }
});

// Получение курса по ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Курс не найден' });
    }
    res.json(course);
  } catch (error) {
    console.error('Ошибка получения курса:', error);
    res.status(500).json({ error: 'Ошибка при получении курса' });
  }
});

// Добавление курса пользователю
app.post('/api/users/:userId/courses/:courseId', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    
    // Проверяем существование пользователя и курса
    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (!course) {
      return res.status(404).json({ error: 'Курс не найден' });
    }
    
    // Проверяем, есть ли уже связь
    const existingRelation = await UserCourse.findOne({
      where: { user_id: userId, course_id: courseId }
    });
    
    if (existingRelation) {
      return res.status(400).json({ error: 'Пользователь уже записан на этот курс' });
    }
    
    // Создаем связь пользователь-курс
    await UserCourse.create({
      user_id: userId,
      course_id: courseId
    });
    
    // Создаем сертификат
    const certificateNumber = `CERT-${Date.now()}-${userId}-${courseId}`;
    await Certificate.create({
      user_id: userId,
      course_id: courseId,
      course_name: course.name,
      student_name: `${user.surname} ${user.name}`,
      level: course.level,
      certificate_number: certificateNumber
    });
    
    res.status(201).json({
      success: true,
      message: 'Курс успешно добавлен. Сертификат создан.',
      certificateCreated: true
    });
    
  } catch (error) {
    console.error('Ошибка добавления курса:', error);
    res.status(500).json({ error: 'Ошибка при добавлении курса' });
  }
});

// Получение курсов пользователя
app.get('/api/users/:userId/courses', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [{
        model: Course,
        as: 'courses',
        through: { attributes: ['enrolled_date'] }
      }]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user.courses);
    
  } catch (error) {
    console.error('Ошибка получения курсов пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении курсов пользователя' });
  }
});

// Получение сертификатов пользователя
app.get('/api/users/:userId/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { user_id: req.params.userId }
    });
    
    res.json(certificates);
    
  } catch (error) {
    console.error('Ошибка получения сертификатов:', error);
    res.status(500).json({ error: 'Ошибка при получении сертификатов' });
  }
});

// Проверка, записан ли пользователь на курс
app.get('/api/users/:userId/courses/:courseId/check', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    
    const relation = await UserCourse.findOne({
      where: {
        user_id: userId,
        course_id: courseId
      }
    });
    
    res.json({
      isEnrolled: !!relation,
      enrolledDate: relation ? relation.enrolled_date : null
    });
    
  } catch (error) {
    console.error('Ошибка проверки записи на курс:', error);
    res.status(500).json({ error: 'Ошибка при проверке записи на курс' });
  }
});

// Получение пользователя по ID с курсами и сертификатами
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name']
        },
        {
          model: Course,
          as: 'courses',
          through: { attributes: ['enrolled_date'] }
        },
        {
          model: Certificate,
          as: 'certificates'
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Форматируем ответ, убираем пароль
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json(userResponse);
    
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
});

// Обновление пользователя
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { surname, name, username, password } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем, занят ли новый username другим пользователем
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
      }
    }
    
    // Обновляем данные
    await user.update({
      surname: surname || user.surname,
      name: name || user.name,
      username: username || user.username,
      ...(password && { password })
    });
    
    // Получаем обновленного пользователя с ролью
    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });
    
    // Форматируем ответ
    const userResponse = updatedUser.toJSON();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'Данные пользователя обновлены',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

// ========== АДМИН РОУТЫ ==========

// Получение всех пользователей (только для админа)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'role'
        },
        {
          model: Course,
          as: 'courses',
          through: { attributes: ['enrolled_date'] }
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Форматируем ответ, убираем пароли
    const usersResponse = users.map(user => {
      const userObj = user.toJSON();
      delete userObj.password;
      return userObj;
    });
    
    res.json(usersResponse);
    
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

// Получение статистики (только для админа)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    const totalCertificates = await Certificate.count();
    
    // Количество пользователей по ролям
    const usersByRole = await User.findAll({
      attributes: ['role_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role_id'],
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });
    
    // Популярность курсов
    const popularCourses = await Course.findAll({
      include: [{
        model: User,
        as: 'students',
        attributes: []
      }],
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('students.id')), 'student_count']
      ],
      group: ['Course.id'],
      order: [[sequelize.literal('student_count'), 'DESC']]
    });
    
    res.json({
      totalUsers,
      totalCourses,
      totalCertificates,
      usersByRole,
      popularCourses: popularCourses.map(course => ({
        id: course.id,
        name: course.name,
        student_count: parseInt(course.get('student_count'))
      }))
    });
    
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

// Удаление пользователя (только для админа)
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Проверяем, существует ли пользователь
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Нельзя удалить самого себя
    // (Здесь можно добавить проверку, если у вас есть информация о текущем пользователе)
    
    // Удаляем пользователя (каскадно удалятся все связи)
    await user.destroy();
    
    res.json({
      success: true,
      message: 'Пользователь успешно удален'
    });
    
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

// ========== STATIC ROUTES ==========

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница авторизации
app.get('/log', (req, res) => {
  res.sendFile(path.join(__dirname, 'log/index.html'));
});

// Страница профиля
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile/index.html'));
});

// Админ панель
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// Страницы курсов
app.get('/courses/:courseName', (req, res) => {
  res.sendFile(path.join(__dirname, `courses/${req.params.courseName}/index.html`));
});

// ========== DATABASE INITIALIZATION ==========

const initializeDatabase = async () => {
  try {
    // Проверяем соединение с базой данных
    await sequelize.authenticate();
    console.log('✓ Соединение с базой данных установлено');
    
    // Синхронизируем модели с базой данных
    await sequelize.sync({ force: true });
    console.log('✓ Модели синхронизированы с базой данных');
    
    // Создаем роли
    const roles = [
      { name: 'admin', description: 'Администратор системы' },
      { name: 'user', description: 'Обычный пользователь' }
    ];
    
    await Role.bulkCreate(roles);
    console.log('✓ Созданы роли пользователей');
    
    // Создаем тестовые курсы
    const coursesData = [
      { name: 'Revit', image: '/assets/images/revit.svg', level: 'Продвинутый' },
      { name: "3D's Max & Corona Render", image: '/assets/images/3Ds_Max_Corona_Render.svg', level: 'Профессиональный' },
      { name: 'SketchUp', image: '/assets/images/SketchUp.svg', level: 'Базовый' },
      { name: 'Blender', image: '/assets/images/blender.svg', level: 'Продвинутый' },
      { name: 'ArchiCAD', image: '/assets/images/archiCAD.svg', level: 'Профессиональный' }
    ];
    
    await Course.bulkCreate(coursesData);
    console.log(`✓ Создано ${coursesData.length} тестовых курсов`);
    
    // Создаем тестового администратора
    // Логин: admin
    // Пароль: admin123
    await User.create({
      surname: 'Администратор',
      name: 'Системы',
      username: 'admin@mail.ru',
      password: 'admin123',
      role_id: 1 // ID роли admin
    });
    
    console.log('✓ Создан тестовый администратор (admin/admin123)');
    
    // Создаем тестового пользователя
    await User.create({
      surname: 'Тестовый',
      name: 'Пользователь',
      username: 'user',
      password: 'user123',
      role_id: 2 // ID роли user
    });
    
    console.log('✓ Создан тестовый пользователь (user/user123)');
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`✓ Сервер запущен на порту ${PORT}`);
      console.log(`✓ Сайт доступен по адресу: http://localhost:${PORT}`);
      console.log(`✓ API доступен по адресу: http://localhost:${PORT}/api`);
      console.log(`✓ Админ панель: http://localhost:${PORT}/admin`);
    });
    
  } catch (error) {
    console.error('✗ Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
};

// Запускаем инициализацию базы данных
initializeDatabase();