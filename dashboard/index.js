import DashboardPage from './DashboardPage';
import en from './i18n/en.json';
import zh from './i18n/zh.json';
import { LayoutDashboard } from 'lucide-react';
import { AUTH_STATE_CHANGED } from "@/framework/contexts/AuthenticationContext.jsx";
import eventBus from "@/framework/lib/eventBus.js";
import navigate from "@/framework/lib/navigationService.js";

export default function register({ registerMenuItem, registerI18nNamespace }) {
  registerI18nNamespace('dashboard', { en, zh });

  // 在应用启动时就监听认证状态变化
  eventBus.on('dashboard', AUTH_STATE_CHANGED, (data) => {
    console.log('Dashboard plugin received auth state change:', data);
    if (data.user) {
      // 用户已登录，使用导航服务导航到管理页面
      console.log('User is logged in, redirecting to admin page:', data.user);

      // 检查当前不在管理页面，避免重复导航
      if (!window.location.pathname.startsWith('/admin')) {
        navigate('/admin');
      }
    }
  });

  const dashboardMenuItem = {
    label: 'dashboard:menu.title',
    path: '/admin',
    component: DashboardPage,
    icon: LayoutDashboard,
    order: 0,
  }

  // 如果整个网站没有landingpage只有后台admin dashboard，可以取消注释以下代码，把dashboard作为根路由，然后上面的AUTH_STATE_CHANGED事件重定向到/
  // registerMenuItem({
  //   ...dashboardMenuItem,
  //   key: 'dashboard-menu-item-root',
  //   path: '/',
  //   position: 'admin'
  // });

  registerMenuItem({
    ...dashboardMenuItem,
    key: 'dashboard-menu-item-admin',
    position: 'admin'
  });

  registerMenuItem({
    ...dashboardMenuItem,
    key: 'dashboard-menu-item-user',
    position: 'user'
  });
}