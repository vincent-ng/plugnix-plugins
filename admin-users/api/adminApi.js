import { supabase } from '@/framework/lib/supabase.js';
import { FunctionsHttpError } from "@supabase/supabase-js";
import { I18nError } from '@/framework/i18n/I18nError.js';

async function handleAdminApiError(error) {
  if (error instanceof FunctionsHttpError) {
    const { error: errorMessage, ...params } = await error.context.json();
    throw new I18nError(errorMessage, params);
  } else if (error) {
    throw error;
  }
}

/**
 * Admin API 封装 - 通过 admin-universal-edge-function 进行安全的管理员操作
 * 所有操作都需要用户具有 admin 角色
 */

/**
 * 调用认证管理 API
 * @param {Object} payload - 请求参数
 * @param {string} payload.operation - 操作类型: select, insert, update, delete
 * @param {string} [payload.userId] - 用户ID (用于 select, update, delete)
 * @param {Object} [payload.data] - 数据 (用于 insert, update)
 * @param {Object} [payload.options] - 选项 (用于 select)
 * @returns {Promise<any>}
 * @description 返回的数据格式根据操作类型而异：
 * - listUsers (select without userId): { users: Array, aud: string, nextPage: string|null, lastPage: number, total: number }
 * - getUserById (select with userId): { user: Object }
 * - 其他操作: 直接返回操作结果
 */
const callAdminApiUser = async (payload) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase.functions.invoke('admin-api-user', {
    body: payload
  });

  await handleAdminApiError(error);

  return data;
};

/**
 * 调用通用管理 API
 * @param {Object} payload - 请求参数
 * @param {string} payload.operation - 操作类型: select, insert, update, delete
 * @param {string} payload.table - 表名
 * @param {Object} [payload.match] - 匹配条件
 * @param {Object|Array} [payload.data] - 数据
 * @param {string} [payload.columns] - 查询列，默认为 '*'
 * @returns {Promise<any>}
 */
const callAdminApi = async (payload) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase.functions.invoke('admin-api-proxy', {
    body: payload
  });

  await handleAdminApiError(error);

  return data;
};

/**
 * 用户管理 API
 */
export const userAdminApi = {
  /**
   * 获取所有用户列表
   * @param {Object} [options] - 查询选项
   * @returns {Promise<{users: Array, aud: string, nextPage: string|null, lastPage: number, total: number}>}
   * @description 返回的数据格式为 { users: [...], aud: "...", nextPage: null, lastPage: 1, total: 2 }
   */
  async listUsers(options = {}) {
    return await callAdminApiUser({
      operation: 'select',
      options
    });
  },

  /**
   * 根据ID获取用户
   * @param {string} userId - 用户ID
   * @returns {Promise<{user: Object}>}
   * @description 返回的数据格式为 { user: {...} }
   */
  async getUserById(userId) {
    return await callAdminApiUser({
      operation: 'select',
      userId
    });
  },

  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @param {Object} [userData.user_metadata] - 用户元数据
   * @param {boolean} [userData.email_confirm] - 是否需要确认邮箱
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    return await callAdminApiUser({
      operation: 'insert',
      data: userData
    });
  },

  /**
   * 更新用户信息
   * @param {string} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>}
   */
  async updateUser(userId, updateData) {
    return await callAdminApiUser({
      operation: 'update',
      userId,
      data: updateData
    });
  },

  /**
   * 删除用户
   * @param {string} userId - 用户ID
   * @returns {Promise<any>}
   */
  async deleteUser(userId) {
    return await callAdminApiUser({
      operation: 'delete',
      userId
    });
  },

  /**
   * 更新用户状态
   * @param {string} userId - 用户ID
   * @param {Object} metadata - 要更新的元数据
   * @returns {Promise<Object>}
   */
  async updateUserMetadata(userId, metadata) {
    return await callAdminApiUser({
      operation: 'update',
      userId,
      data: { user_metadata: metadata }
    });
  }
};

/**
 * 通用管理员 API
 * 可以用于其他需要管理员权限的操作
 */
export const adminApi = {
  /**
   * 通用查询
   * @param {string} table - 表名
   * @param {Object} [options] - 查询选项
   * @returns {Promise<Array>}
   */
  async select(table, options = {}) {
    return await callAdminApi({
      operation: 'select',
      table,
      ...options
    });
  },

  /**
   * 通用插入
   * @param {string} table - 表名
   * @param {Object|Array} data - 插入数据
   * @returns {Promise<Array>}
   */
  async insert(table, data) {
    return await callAdminApi({
      operation: 'insert',
      table,
      data
    });
  },

  /**
   * 通用更新
   * @param {string} table - 表名
   * @param {Object} match - 匹配条件
   * @param {Object} data - 更新数据
   * @returns {Promise<Array>}
   */
  async update(table, match, data) {
    return await callAdminApi({
      operation: 'update',
      table,
      match,
      data
    });
  },

  /**
   * 通用删除
   * @param {string} table - 表名
   * @param {Object} match - 匹配条件
   * @returns {Promise<any>}
   */
  async delete(table, match) {
    return await callAdminApi({
      operation: 'delete',
      table,
      match
    });
  }
};

export default { userAdminApi, adminApi };