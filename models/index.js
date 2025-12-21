const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Создаем подключение к базе данных
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: console.log,
});

// Модель ролей
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Модель пользователя
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    defaultValue: 2, // По умолчанию обычный пользователь
    references: {
      model: 'roles',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Модель курса
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Модель сертификата
const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  course_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  student_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issue_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false
  },
  certificate_number: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  tableName: 'certificates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Промежуточная таблица для связи пользователь-курс
const UserCourse = sequelize.define('UserCourse', {
  enrolled_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_courses',
  timestamps: false
});

// ========== ОПРЕДЕЛЕНИЕ СВЯЗЕЙ ==========

// Роль -> Пользователь (One-to-Many)
Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users'
});

User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});

// Пользователь <-> Курс (Many-to-Many)
User.belongsToMany(Course, {
  through: UserCourse,
  foreignKey: 'user_id',
  otherKey: 'course_id',
  as: 'courses'
});

Course.belongsToMany(User, {
  through: UserCourse,
  foreignKey: 'course_id',
  otherKey: 'user_id',
  as: 'students'
});

// Пользователь -> Сертификат (One-to-Many)
User.hasMany(Certificate, {
  foreignKey: 'user_id',
  as: 'certificates'
});

Certificate.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Курс -> Сертификат (One-to-Many)
Course.hasMany(Certificate, {
  foreignKey: 'course_id',
  as: 'certificates'
});

Certificate.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// Экспортируем все модели и sequelize
module.exports = {
  sequelize,
  Role,
  User,
  Course,
  Certificate,
  UserCourse
};