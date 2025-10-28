import UserListPage from './pages/UserListPage.jsx';
import UserDetailPage from './pages/UserDetailPage.jsx';
import CreateUserPage from './pages/CreateUserPage.jsx';
import enTranslations from './i18n/en.json';
import zhTranslations from './i18n/zh.json';

// 用户管理插件的翻译资源
const translations = {
  en: enTranslations,
  zh: zhTranslations
};

// 用户管理插件注册函数
export default function registerUserPlugin({ registerMenuItem, registerRoute, registerI18nNamespace }) {
  // 注册国际化资源
  registerI18nNamespace('admin-users', translations);

  // 注册菜单项和路由
  registerMenuItem({
    key: 'admin-users',
    label: 'admin-users:title',
    path: '/admin/users',
    component: UserListPage,
    icon: '👥',
    order: 2,
    position: 'admin'
  });

  registerRoute({
    path: '/admin/users/create',
    component: CreateUserPage,
    layout: 'admin',
  });

  registerRoute({
    path: '/admin/users/:id',
    component: UserDetailPage,
    layout: 'admin',
  });

  console.log('User plugin registered');
}