/**
 * Менеджер пользователей (работает с БД через API)
 */
class UsersManager {
  constructor() {
    this.baseUrl = '/api';
  }

  /**
   * Регистрация пользователя
   */
  async add(surname, name, username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surname, name, username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      // Сохраняем пользователя в localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  }

  /**
   * Авторизация пользователя
   */
  async setCurrentUser(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      throw error;
    }
  }

  /**
   * Получение текущего пользователя из localStorage
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Проверка, является ли пользователь администратором
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  /**
   * Проверка авторизации
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  /**
   * Получение всех пользователей (только для админа)
   */
  async getAllUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`);
      if (!response.ok) {
        throw new Error('Доступ запрещен или ошибка сервера');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      throw error;
    }
  }

  /**
   * Получение статистики (только для админа)
   */
  async getStats() {
    try {
      const response = await fetch(`${this.baseUrl}/admin/stats`);
      if (!response.ok) {
        throw new Error('Доступ запрещен или ошибка сервера');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }

  /**
   * Удаление пользователя (только для админа)
   */
  async deleteUser(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка удаления пользователя');
      }

      return data;
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      throw error;
    }
  }

  /**
   * Выход из системы
   */
  logout() {
    localStorage.removeItem('currentUser');
  }
}

/**
 * Менеджер курсов (работает с БД через API)
 */
class CoursesManager {
  constructor() {
    this.baseUrl = '/api';
  }

  /**
   * Получение всех курсов
   */
  async getAllCourses() {
    try {
      const response = await fetch(`${this.baseUrl}/courses`);
      if (!response.ok) {
        throw new Error('Ошибка при получении курсов');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения курсов:', error);
      return [];
    }
  }

  /**
   * Получение курсов пользователя
   */
  async getUserCourses(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/courses`);
      if (!response.ok) {
        throw new Error('Ошибка при получении курсов пользователя');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения курсов пользователя:', error);
      return [];
    }
  }

  /**
   * Добавление курса пользователю
   */
  async addCourseToUser(userId, courseId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/courses/${courseId}`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка добавления курса');
      }

      return data;
    } catch (error) {
      console.error('Ошибка добавления курса:', error);
      throw error;
    }
  }

  /**
   * Проверка, записан ли пользователь на курс
   */
  async checkUserEnrollment(userId, courseId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/courses/${courseId}/check`);
      
      if (response.ok) {
        return await response.json();
      }
      
      return { isEnrolled: false };
      
    } catch (error) {
      console.error('Ошибка проверки записи:', error);
      return { isEnrolled: false };
    }
  }
}

/**
 * Менеджер сертификатов (работает с БД через API)
 */
class CertificatesManager {
  constructor() {
    this.baseUrl = '/api';
  }

  /**
   * Получение сертификатов пользователя
   */
  async getUserCertificates(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/certificates`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Ошибка получения сертификатов:', error);
      return [];
    }
  }
}