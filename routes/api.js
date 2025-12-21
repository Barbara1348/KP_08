const express = require('express');
const router = express.Router();
const { User, Course, Certificate, UserCourse } = require('../models');

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { surname, name, username, password } = req.body;
    
    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }
    
    const user = await User.create({
      surname,
      name,
      username,
      password
    });
    
    // Не возвращаем пароль
    const userResponse = user.toJSON();
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
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    
    const isValidPassword = user.verifyPassword(password);
    if (!isValidPassword) {
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
    
    const userResponse = user.toJSON();
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
      student_name: user.getFullName(),
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

module.exports = router;