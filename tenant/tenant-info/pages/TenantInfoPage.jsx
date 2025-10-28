import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/framework/contexts/TenantContext';
import { Button } from '@/framework/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/framework/components/ui/dialog';
import { Building2, Users, Trash2 } from 'lucide-react';
import { deleteTenant, getTenantInfo, getTenantMemberCount } from '../.././api/tenants';
import { toast } from 'sonner';
import Authorized from '@/framework/components/Authorized';

const TenantInfoPage = () => {
  const { t } = useTranslation(['tenant-info', 'tenant']);
  const { currentTenant, userRole, setCurrentTenant, refreshUserTenants } = useTenant();

  // 状态管理
  const [tenantInfo, setTenantInfo] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 当 currentTenant 变化时，加载组织信息
  useEffect(() => {
    if (!currentTenant) {
      setTenantInfo(null);
      setMemberCount(0);
      return;
    }

    const loadTenantInfo = async () => {
      try {
        setLoading(true);

        // 获取组织详细信息
        const tenantData = await getTenantInfo(currentTenant.id);

        // 获取组织成员数量
        const count = await getTenantMemberCount(currentTenant.id);

        setTenantInfo(tenantData);
        setMemberCount(count);
      } catch (error) {
        console.error('Error loading tenant info:', error);
        toast.error(t('tenant-info:loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadTenantInfo();
  }, [currentTenant, t]);

  // 删除组织
  const handleDeleteTenant = async () => {
    if (!currentTenant) return;

    try {
      setIsDeleting(true);

      // 删除组织（级联删除会自动处理相关表）
      await deleteTenant(currentTenant.id);

      toast.success(t('tenant-info:deleteSuccess'));
      setDeleteDialogOpen(false);

      // 刷新组织列表并切换到个人工作区
      await refreshUserTenants();
      setCurrentTenant(null);
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error(t('tenant-info:deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('common:loading')}</div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('tenant-info:noTenantSelected')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('tenant:selectTenant')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('tenant-info:title')}</h1>
        <Authorized permission="db.tenants.delete">
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t('tenant-info:deleteTenant')}
          </Button>
        </Authorized>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('tenant-info:basicInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t('tenant:tenantName')}</p>
              <p className="text-lg font-semibold">{tenantInfo?.name || currentTenant.name}</p>
            </div>

            {tenantInfo?.description && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{t('tenant:tenantDescription')}</p>
                <p className="text-sm">{tenantInfo.description}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t('tenant-info:yourRole')}</p>
              <Badge variant="secondary">{t(`tenant:${userRole?.toLowerCase()}`)}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t('tenant-info:createdAt')}</p>
              <p className="text-sm">
                {new Date(tenantInfo?.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('tenant-info:statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t('tenant-info:totalMembers')}</p>
              <p className="text-2xl font-bold">{memberCount}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t('tenant-info:tenantId')}</p>
              <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                {currentTenant.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              {t('tenant-info:deleteConfirmTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('tenant-info:deleteConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-800">
              <strong>{t('tenant-info:warning')}:</strong> {t('tenant-info:deleteWarning')}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t('common:cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTenant}
              disabled={isDeleting}
            >
              {isDeleting ? t('tenant-info:deleting') : t('tenant-info:confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantInfoPage;