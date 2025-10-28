import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userAdminApi } from '../api/adminApi';

const UserDetailPage = () => {
  const { t } = useTranslation(['admin-users', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      // 直接获取数据，无需处理错误，因为框架的顶层已有错误捕获并显示到 toast
      const data = await userAdminApi.getUserById(id);

      if (data) {
        // Supabase返回的数据格式为 { user: {...} } 或直接是用户对象
        // 根据API文档，getUserById返回的是 { user: {...} }
        const userData = data.user || data;

        const formattedUser = {
          id: userData.id,
          name: userData.user_metadata?.name || userData.email.split('@')[0],
          email: userData.email,
          role: userData.user_metadata?.role || 'user',
          status: userData.email_confirmed_at ? 'active' : 'inactive',
          createdAt: new Date(userData.created_at).toLocaleDateString(),
          lastLogin: userData.last_sign_in_at ? new Date(userData.last_sign_in_at).toLocaleString() : 'N/A',
          phone: userData.user_metadata?.phone || '',
          department: userData.user_metadata?.department || '',
          bio: userData.user_metadata?.bio || '',
          ...userData.user_metadata,
        };
        setUser(formattedUser);
        setFormData({
          name: formattedUser.name,
          email: formattedUser.email,
          role: formattedUser.role,
          phone: formattedUser.phone,
          department: formattedUser.department,
          bio: formattedUser.bio,
        });
      }
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    await userAdminApi.updateUserMetadata(id, {
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      department: formData.department,
      bio: formData.bio,
    });

    const updatedUser = {
      ...user,
      ...formData,
    };
    setUser(updatedUser);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(t('confirmDelete'))) {
      await userAdminApi.deleteUser(id);
      navigate('/admin/users');
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    // This is a simplified example. In a real app, you might need to
    // call a server-side function to handle user status updates.
    await userAdminApi.updateUserMetadata(
      id,
      { status: newStatus }
    );

    setUser({ ...user, status: newStatus });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-muted-foreground">
          {t('common:loading')}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-4">
          {t('userNotFound')}
        </div>
        <Link
          to="/admin/users"
          className="text-primary hover:text-primary/80"
        >
          {t('returnToUserList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 导航和操作 */}
      <div className="flex justify-between items-center">
        <Link
          to="/admin/users"
          className="text-primary hover:text-primary/80 text-sm"
        >
          ← {t('returnToUserList')}
        </Link>
        <div className="flex space-x-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {t('edit')}
              </button>
              <button
                onClick={handleStatusToggle}
                className={`px-4 py-2 rounded-md text-sm font-medium ${user.status === 'active'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                {user.status === 'active' ? t('deactivate') : t('activate')}
              </button>
              <button
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                {t('delete')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {t('common:save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                {t('common:cancel')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 用户信息 */}
      <div className="bg-card text-card-foreground shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-16 w-16">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-foreground">
                {user.name}
              </h1>
              <p className="text-muted-foreground">
                {user.email}
              </p>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                  {user.role === 'admin' ? t('admin') : t('userRole')}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                  {user.status === 'active' ? t('active') : t('inactive')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                {t('basicInfo')}
              </h3>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('name')}
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground"
                  />
                ) : (
                  <p className="text-foreground">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('email')}
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground"
                  />
                ) : (
                  <p className="text-foreground">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('phone')}
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground"
                  />
                ) : (
                  <p className="text-foreground">{user.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('department')}
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground"
                  />
                ) : (
                  <p className="text-foreground">{user.department}</p>
                )}
              </div>
            </div>

            {/* 系统信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                {t('systemInfo')}
              </h3>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('role')}
                </label>
                {editing ? (
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground"
                  >
                    <option value="user">{t('userRole')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                ) : (
                  <p className="text-foreground">
                    {user.role === 'admin' ? t('admin') : t('userRole')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('createdAt')}
                </label>
                <p className="text-foreground">{user.createdAt}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('lastLogin')}
                </label>
                <p className="text-foreground">{user.lastLogin}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t('bio')}
                </label>
                {editing ? (
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground"
                  />
                ) : (
                  <p className="text-foreground">{user.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;