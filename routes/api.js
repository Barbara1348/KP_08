const express = require('express');
const router = express.Router();
const { User, Course, Certificate, UserCourse, Role } = require('../models');

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    console.log('Регистрация пользователя:', req.body);
    
    const { surname, name, username, password } = req.body;
    
    // Валидация
    if (!surname || !name || !username || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }
    
    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }
    
    // Находим роль "user" по умолчанию
    const userRole = await Role.findOne({ where: { name: 'user' } });
    if (!userRole) {
      return res.status(500).json({ error: 'Роль пользователя не найдена' });
    }
    
    const user = await User.create({
      surname,
      name,
      username,
      password,
      role_id: userRole.id
    });
    
    // Получаем пользователя с ролью
    const userWithRole = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });
    
    // Не возвращаем пароль
    const userResponse = userWithRole.toJSON();
    delete userResponse.password;
    
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
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }
    
    const user = await User.findOne({ 
      where: { username },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    // Простая проверка пароля (в реальном проекте используйте хеширование!)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    // Не возвращаем пароль
    const userResponse = user.toJSON();
    delete userResponse.password;
    
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

// Получение пользователя по ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name']
        },
        {
          model: Course,
          as: 'courses',
          through: { attributes: [] }
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
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
});

// Обновление пользователя
router.put('/users/:id', async (req, res) => {
  try {
    const { surname, name, username, password } = req.body;
    const user = await User.findByPk(req.params.id);
    
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
    
    await user.update({
      surname: surname || user.surname,
      name: name || user.name,
      username: username || user.username,
      ...(password && { password })
    });
    
    // Получаем обновленного пользователя с ролью
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });
    
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

// Получение всех курсов
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error) {
    console.error('Ошибка получения курсов:', error);
    res.status(500).json({ error: 'Ошибка при получении курсов' });
  }
});

// Получение курса по ID
router.get('/courses/:id', async (req, res) => {
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
router.post('/users/:userId/courses/:courseId', async (req, res) => {
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
    
    // Создаем связь
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
      message: 'Курс успешно добавлен пользователю',
      certificateCreated: true
    });
  } catch (error) {
    console.error('Ошибка добавления курса:', error);
    res.status(500).json({ error: 'Ошибка при добавлении курса' });
  }
});

// Получение курсов пользователя
router.get('/users/:userId/courses', async (req, res) => {
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
router.get('/users/:userId/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { user_id: req.params.userId },
      include: [{
        model: Course,
        as: 'course'
      }]
    });
    
    res.json(certificates);
  } catch (error) {
    console.error('Ошибка получения сертификатов:', error);
    res.status(500).json({ error: 'Ошибка при получении сертификатов' });
  }
});

// Проверка, записан ли пользователь на курс
router.get('/users/:userId/courses/:courseId/check', async (req, res) => {
  try {
    const relation = await UserCourse.findOne({
      where: {
        user_id: req.params.userId,
        course_id: req.params.courseId
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

// АДМИН РОУТЫ

// Получение всех пользователей (только для админа)
router.get('/admin/users', async (req, res) => {
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
          through: { attributes: [] }
        },
        {
          model: Certificate,
          as: 'certificates'
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
router.get('/admin/stats', async (req, res) => {
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
router.delete('/admin/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Проверяем, существует ли пользователь
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
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

module.exports = router;