import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { userAdminApi } from '../api/adminApi';

const CreateUserPage = () => {
  const { t } = useTranslation(['user', 'common']);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    role: 'user',
    status: 'active',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 验证表单
      if (!formData.name.trim()) {
        throw new Error('姓名不能为空');
      }
      if (!formData.email.trim()) {
        throw new Error('邮箱不能为空');
      }
      if (!formData.password) {
        throw new Error('密码不能为空');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }
      if (formData.password.length < 6) {
        throw new Error('密码长度至少为6位');
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('请输入有效的邮箱地址');
      }

      const { error } = await userAdminApi.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // 自动确认邮箱
        user_metadata: {
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          department: formData.department,
          bio: formData.bio,
          status: formData.status
        },
      });

      if (error) {
        throw error;
      }

      toast.success(t('createSuccess'));
      navigate('/admin/users');
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMessage = err.message || '创建用户失败';
      setError(errorMessage);
      toast.error(t('createFailed'), { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* 页面标题和导航 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            {t('create')}
          </h1>
          <Link
            to="/admin/users"
            className="text-primary hover:text-primary/80 text-sm"
          >
            ← 返回用户列表
          </Link>
        </div>
  
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}
  
        {/* 创建表单 */}
        <div className="bg-card text-card-foreground shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="请输入用户姓名"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
  
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    {t('email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="请输入邮箱地址"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
  
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    电话
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="请输入电话号码"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
  
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
                    部门
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="请输入所属部门"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
  
            {/* 密码设置 */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                密码设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    密码 *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="请输入密码（至少6位）"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
  
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    确认密码 *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="请再次输入密码"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
  
            {/* 权限设置 */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                权限设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                    {t('role')}
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="user">{t('userRole')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
  
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                    {t('status')}
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                  </select>
                </div>
              </div>
            </div>
  
            {/* 个人简介 */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                个人简介
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="请输入个人简介"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
  
            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/admin/users"
                className="px-4 py-2 border border-input rounded-md text-sm font-medium text-foreground hover:bg-secondary/80"
              >
                {t('common:cancel')}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common:loading') : t('create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

export default CreateUserPage;