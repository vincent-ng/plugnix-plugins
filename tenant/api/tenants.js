import { supabase } from '@/framework/lib/supabase';

export const createTenant = async (name, description) => {
  const { data, error } = await supabase.rpc('create_tenant', {
    p_tenant_name: name,
    p_tenant_description: description,
  });

  if (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }

  return data;
};

export const deleteTenant = async (tenantId) => {
  const { data, error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId);

  if (error) {
    console.error('Error deleting tenant:', error);
    throw error;
  }

  return data;
};

export const getTenantInfo = async (tenantId) => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (error) {
    console.error('Error fetching tenant info:', error);
    throw error;
  }

  return data;
};

export const getTenantMemberCount = async (tenantId) => {
  const { count, error } = await supabase
    .from('tenant_users')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Error fetching tenant member count:', error);
    throw error;
  }

  return count || 0;
};