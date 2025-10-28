-- =====================================================================================
-- ==                                                                                 ==
-- ==                Web Plugin Framework - Tenant-Based Init Script                 ==
-- ==                                                                                 ==
-- =====================================================================================
--
-- This script contains all the necessary SQL to set up the database for the framework,
-- including helper functions, core permission system tables, and initial data.
--
-- Instructions:
-- 1. Navigate to the SQL Editor in your Supabase project.
-- 2. Copy and paste the entire content of this file.
-- 3. Run the script.
--

-- =====================================================================================
-- SECTION 1: CORE HELPER FUNCTIONS
-- =====================================================================================

-- Function to get the well-known ID of the 'System' tenant.
CREATE OR REPLACE FUNCTION get_system_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000001';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to automatically update the `updated_at` timestamp on row modification.
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to keep the redundant `tenant_id` in `role_permissions` in sync.
CREATE OR REPLACE FUNCTION sync_role_permissions_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  -- On insert or update, copy the tenant_id from the associated role.
  SELECT tenant_id INTO NEW.tenant_id
  FROM public.roles
  WHERE id = NEW.role_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- SECTION 2: CORE PERMISSION FUNCTIONS
-- =====================================================================================

-- 优雅的权限检查函数
-- 简洁、明确、无冗余的设计

-- 检查当前用户是否具有系统级权限
CREATE OR REPLACE FUNCTION check_permission(p_permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_tenant_permission(get_system_tenant_id(), p_permission_name, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查指定用户是否具有系统级权限
CREATE OR REPLACE FUNCTION user_has_system_permission(p_user_id UUID, p_permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_has_tenant_permission(p_user_id, get_system_tenant_id(), p_permission_name, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查当前用户是否具有租户权限（可选择是否回退到系统权限）
CREATE OR REPLACE FUNCTION check_tenant_permission(p_tenant_id UUID, p_permission_name TEXT, with_system_fallback BOOLEAN DEFAULT true)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_has_tenant_permission(auth.uid(), p_tenant_id, p_permission_name, with_system_fallback);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查指定用户是否具有租户权限（可选择是否回退到系统权限）
CREATE OR REPLACE FUNCTION user_has_tenant_permission(
  p_user_id UUID,
  p_tenant_id UUID,
  p_permission_name TEXT,
  p_fallback_to_system BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  -- 检查租户内权限
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    JOIN public.role_permissions rp ON tu.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE tu.user_id = p_user_id
      AND tu.tenant_id = p_tenant_id
      AND p.name = p_permission_name
  ) INTO has_perm;

  -- 如果有租户权限或不需要回退到系统权限，直接返回结果
  IF has_perm OR NOT p_fallback_to_system THEN
    RETURN has_perm;
  END IF;

  -- 回退到系统权限检查
  RETURN user_has_system_permission(p_user_id, p_permission_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查指定用户是否可以授予特定权限给角色
CREATE OR REPLACE FUNCTION user_can_grant_permission(p_user_id UUID, p_role_id UUID, p_permission_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tenant_id UUID;
  v_permission_name TEXT;
  v_is_system_permission BOOLEAN;
BEGIN
  -- 获取角色的tenant_id
  SELECT tenant_id INTO v_tenant_id
  FROM public.roles
  WHERE id = p_role_id;

  -- 如果角色是全局模板（tenant_id为NULL），只有系统管理员可以修改
  IF v_tenant_id IS NULL THEN
    RETURN user_has_system_permission(p_user_id, 'system.rpc.invoke');
  END IF;

  -- 获取被授予权限的名称
  SELECT name INTO v_permission_name
  FROM public.permissions
  WHERE id = p_permission_id;

  -- 检查是否为系统权限
  v_is_system_permission := v_permission_name LIKE 'system.%';

  -- 如果是系统权限，用户必须是系统管理员
  IF v_is_system_permission THEN
    RETURN user_has_system_permission(p_user_id, 'system.rpc.invoke');
  END IF;

  -- 如果不是系统权限，用户必须具有role_permissions的insert权限
  RETURN user_has_tenant_permission(p_user_id, v_tenant_id, 'db.role_permissions.insert');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查当前用户是否可以授予特定权限给角色
CREATE OR REPLACE FUNCTION can_grant_permission(p_role_id UUID, p_permission_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_can_grant_permission(auth.uid(), p_role_id, p_permission_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================================
-- SECTION 3: RLS/POLICY HELPER FUNCTIONS
-- =====================================================================================

-- Unified helper function to create a Row-Level Security (RLS) policy.
-- It automatically handles the distinction between INSERT (WITH CHECK) and other actions (USING).
-- If p_expression is not provided, it defaults to a standard check based on table and action name.
CREATE OR REPLACE FUNCTION create_rls_policy(p_table text, p_action text, p_expression text DEFAULT NULL, p_tenant_id_column text DEFAULT 'tenant_id')
RETURNS void AS $$
DECLARE
    command text;
    final_expression text;
    policy_template text;
    v_action_lower text := LOWER(p_action);
BEGIN
    -- Generate a default expression if not provided
    IF p_expression IS NULL THEN
        -- Use the specified tenant_id column, defaulting to 'tenant_id'.
        -- %I safely quotes identifiers (like column names).
        -- The ''::text'' cast resolves the function signature in dynamic SQL.
        final_expression := format('check_tenant_permission(%I, ''db.%s.%s''::text)', p_tenant_id_column, p_table, v_action_lower);
    ELSE
        final_expression := p_expression;
    END IF;

    -- Determine the policy clause based on the action
  -- INSERT policies use `WITH CHECK`, while others use `USING`.
  IF v_action_lower = 'insert' THEN
    policy_template := 'CREATE POLICY "Allow %s on %s" ON public.%I FOR %s WITH CHECK (%s);';
  ELSE
    policy_template := 'CREATE POLICY "Allow %s on %s" ON public.%I FOR %s USING (%s);';
  END IF;

  -- Execute the dynamic SQL to create the policy.
  EXECUTE format(policy_template, p_action, p_table, p_table, p_action, final_expression);
END;
$$ LANGUAGE plpgsql;

-- Helper function to drop a previously created RLS policy.
CREATE OR REPLACE FUNCTION drop_rls_policy(p_table TEXT, p_action TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'DROP POLICY IF EXISTS "Allow %s on %s" ON public.%I;',
    p_action, p_table, p_table
  );
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- SECTION 4: UNIFIED PERMISSION MODEL (TABLES)
-- =====================================================================================

-- Table to store all available permissions in the system.
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN permissions.name IS 'e.g., "db.tenants.create", "ui.dashboard.view"';
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to permissions" ON permissions FOR SELECT USING (true);
CREATE TRIGGER on_permissions_update BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Tenants are the core of the new permission system.
-- Each tenant can have associated users and permissions.
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
-- Policies for `tenants` table
SELECT create_rls_policy('tenants', 'SELECT', p_tenant_id_column := 'id');
SELECT create_rls_policy('tenants', 'INSERT', p_tenant_id_column := 'id');
SELECT create_rls_policy('tenants', 'UPDATE', p_tenant_id_column := 'id');
SELECT create_rls_policy('tenants', 'DELETE', p_tenant_id_column := 'id');
CREATE TRIGGER on_tenants_update BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Roles are defined within each tenant.
-- A tenant owner can create, modify, and delete roles within their tenant.
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, name)
);
COMMENT ON COLUMN roles.tenant_id IS 'The tenant this role belongs to. If NULL, this indicates it is a global role template.';
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
-- Policies for `roles` table
SELECT create_rls_policy('roles', 'SELECT', '(tenant_id IS NULL) OR (check_tenant_permission(tenant_id, ''db.roles.select''))');
SELECT create_rls_policy('roles', 'INSERT');
SELECT create_rls_policy('roles', 'UPDATE');
SELECT create_rls_policy('roles', 'DELETE');
CREATE TRIGGER on_roles_update BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Junction table for the many-to-many relationship between roles and permissions.
-- Defines which permissions are granted to a specific role.
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  tenant_id UUID,
  PRIMARY KEY (role_id, permission_id)
);
COMMENT ON COLUMN role_permissions.tenant_id IS 'Redundant for performance, synced from roles.tenant_id via trigger.';
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER on_role_permissions_sync_tenant_id
  BEFORE INSERT OR UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION sync_role_permissions_tenant_id();
-- Policies for `role_permissions` table
-- RLS policies for role_permissions
-- Users can see permissions if they have select permissions for the tenant.
SELECT create_rls_policy('role_permissions', 'SELECT', '(tenant_id IS NULL) OR (check_tenant_permission(tenant_id, ''db.role_permissions.select''))');
SELECT create_rls_policy('role_permissions', 'INSERT', 'can_grant_permission(role_id, permission_id)');
SELECT create_rls_policy('role_permissions', 'DELETE');

-- Junction table for the many-to-many relationship between users and tenants, assigning a role.
-- Defines user membership and their role within a tenant.
CREATE TABLE tenant_users (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);
COMMENT ON TABLE tenant_users IS 'Assigns a user to a tenant with a specific role.';
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
-- Policies for `tenant_users` table
SELECT create_rls_policy('tenant_users', 'SELECT');
SELECT create_rls_policy('tenant_users', 'INSERT');
SELECT create_rls_policy('tenant_users', 'UPDATE');
SELECT create_rls_policy('tenant_users', 'DELETE');


-- =====================================================================================
-- SECTION 5: TENANT MANAGEMENT FUNCTIONS (RPC)
-- =====================================================================================

-- Creates a new tenant and sets the calling user as its owner.
-- This function links the creator to the 'Owner' template role for the new tenant.
-- It does not copy the role or its permissions, ensuring efficiency.
CREATE OR REPLACE FUNCTION create_tenant(p_tenant_name TEXT, p_tenant_description TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
  owner_role_id UUID;
BEGIN
  -- 0. Validate the input parameter.
  IF p_tenant_name IS NULL OR trim(p_tenant_name) = '' THEN
    RAISE EXCEPTION 'tenant:db.tenantNameEmpty';
  END IF;

  -- Check for duplicate tenant names for the current user.
  IF EXISTS (
    SELECT 1
    FROM public.tenants t
    JOIN public.tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid() AND t.name = p_tenant_name
  ) THEN
    RAISE EXCEPTION 'tenant:db.tenantNameExists';
  END IF;

  -- 1. Find the template 'Owner' role.
  SELECT id INTO owner_role_id
  FROM public.roles
  WHERE name = 'Owner' AND tenant_id IS NULL;

  IF owner_role_id IS NULL THEN
    RAISE EXCEPTION 'tenant:db.tenantOwnerRoleNotFound';
  END IF;

  -- 2. Create the new tenant.
  INSERT INTO public.tenants (name, description)
  VALUES (p_tenant_name, p_tenant_description)
  RETURNING id INTO new_tenant_id;

  -- 3. Set the creator as the 'Owner' in the tenant_users table.
  INSERT INTO public.tenant_users (tenant_id, user_id, role_id)
  VALUES (new_tenant_id, auth.uid(), owner_role_id);

  -- 4. Return the new tenant's ID.
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Promotes a user to a system administrator.
-- If p_user_id is NULL, it will promote the first user found in the system.
CREATE OR REPLACE FUNCTION promote_user_to_admin(p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
  admin_role_id UUID;
  system_tenant_id UUID := get_system_tenant_id();
BEGIN
  -- 1. Determine the target user ID.
  IF p_user_id IS NULL THEN
    SELECT id INTO target_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    IF target_user_id IS NULL THEN
      RAISE EXCEPTION 'No users found in the system.';
    END IF;
  ELSE
    target_user_id := p_user_id;
  END IF;

  -- 2. Get the Admin role ID from the System tenant.
  -- It's the first role created for the system tenant.
  SELECT id INTO admin_role_id
  FROM public.roles
  WHERE tenant_id = system_tenant_id
  ORDER BY created_at
  LIMIT 1;

  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'tenant:db.systemAdminRoleNotFound';
  END IF;

  -- 3. Add the user to the System tenant with the Admin role.
  -- Use ON CONFLICT to avoid errors if the user is already in the tenant.
  INSERT INTO public.tenant_users (tenant_id, user_id, role_id)
  VALUES (system_tenant_id, target_user_id, admin_role_id)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role_id = admin_role_id;

  RAISE NOTICE 'User % has been promoted to system administrator.', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================================
-- SECTION 6: GRANULAR TABLE MANAGEMENT FUNCTIONS (RPC)
-- =====================================================================================

-- 6.1 `updated_at` timestamp management
CREATE OR REPLACE FUNCTION add_updated_at_trigger(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = p_table_name AND column_name = 'updated_at') THEN
    RAISE EXCEPTION 'Table "public.%" does not have an "updated_at" column.', p_table_name;
  END IF;
  EXECUTE format('CREATE TRIGGER on_%s_update BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION handle_updated_at();', p_table_name, p_table_name);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_updated_at_trigger(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  EXECUTE format('DROP TRIGGER IF EXISTS on_%s_update ON public.%I;', p_table_name, p_table_name);
END;
$$ LANGUAGE plpgsql;

-- 6.2 Row-Level Security (RLS) and Tenant Policies
CREATE OR REPLACE FUNCTION setup_rbac_rls(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- 1. Check permission
    IF NOT check_permission('system.rpc.invoke') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    -- 2. Ensure the table has a `tenant_id` column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = p_table_name
          AND column_name = 'tenant_id'
    ) THEN
        RAISE EXCEPTION 'Table "public.%" must have a "tenant_id" column to use tenant-based policies.', p_table_name;
    END IF;

    -- 3. Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table_name);

    -- 4. Add RBAC policies using the helper functions
    PERFORM create_rls_policy(p_table_name, 'SELECT');
    PERFORM create_rls_policy(p_table_name, 'INSERT');
    PERFORM create_rls_policy(p_table_name, 'UPDATE');
    PERFORM create_rls_policy(p_table_name, 'DELETE');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION teardown_rbac_rls(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- 1. Check permission
    IF NOT check_permission('system.rpc.invoke') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    -- 2. Remove RBAC policies using the helper function
    PERFORM drop_rls_policy(p_table_name, 'SELECT');
    PERFORM drop_rls_policy(p_table_name, 'INSERT');
    PERFORM drop_rls_policy(p_table_name, 'UPDATE');
    PERFORM drop_rls_policy(p_table_name, 'DELETE');

    -- 3. Disable RLS
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', p_table_name);
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- SECTION 7: INITIAL SYSTEM DATA & TEMPLATE ROLES
-- =====================================================================================

-- Create the foundational 'System' tenant. This tenant is for managing admins and system-level permissions.
INSERT INTO public.tenants (id, name, description) VALUES (get_system_tenant_id(), 'System', 'Tenant for system-level administrators and permissions.');

-- Define the core permissions required for the system.
-- Some are for admins (via the System tenant), others are for role-based assignment within user tenants.
INSERT INTO permissions (name, description) VALUES
  -- System-level permissions for admins
  ('system.rpc.invoke', 'permissions.system.rpc.invoke'),

  ('db.auth.users.select', 'permissions.db.auth.users.select'),
  ('db.auth.users.insert', 'permissions.db.auth.users.insert'),
  ('db.auth.users.update', 'permissions.db.auth.users.update'),
  ('db.auth.users.delete', 'permissions.db.auth.users.delete'),

  ('db.permissions.select', 'permissions.db.permissions.select'),
  ('db.permissions.insert', 'permissions.db.permissions.insert'),
  ('db.permissions.update', 'permissions.db.permissions.update'),
  ('db.permissions.delete', 'permissions.db.permissions.delete'),

  -- Tenant management permissions (can be assigned to roles)
  ('db.tenants.select', 'permissions.db.tenants.select'),
  ('db.tenants.update', 'permissions.db.tenants.update'),
  ('db.tenants.delete', 'permissions.db.tenants.delete'),

  -- Role management permissions (can be assigned to roles)
  ('db.roles.select', 'permissions.db.roles.select'),
  ('db.roles.insert', 'permissions.db.roles.insert'),
  ('db.roles.update', 'permissions.db.roles.update'),
  ('db.roles.delete', 'permissions.db.roles.delete'),

  -- Role-permission assignment permissions (can be assigned to roles)
  ('db.role_permissions.select', 'permissions.db.role_permissions.select'),
  ('db.role_permissions.insert', 'permissions.db.role_permissions.insert'),
  ('db.role_permissions.delete', 'permissions.db.role_permissions.delete'),

  -- Tenant membership permissions (can be assigned to roles)
  ('db.tenant_users.select', 'permissions.db.tenant_users.select'),
  ('db.tenant_users.insert', 'permissions.db.tenant_users.insert'),
  ('db.tenant_users.update', 'permissions.db.tenant_users.update'),
  ('db.tenant_users.delete', 'permissions.db.tenant_users.delete');

-- Insert template roles (tenant_id is NULL). These are read-only templates for user-created tenants.
INSERT INTO public.roles (name, description) VALUES
('Owner', 'Has all permissions for a tenant.'),
('Member', 'Can view content and participate in a tenant.');

-- Create the 'Admin' role within the 'System' tenant.
INSERT INTO public.roles (tenant_id, name, description)
VALUES (get_system_tenant_id(), 'Admin', 'System Administrator with full permissions.');

-- Assign all existing permissions to the 'Admin' role in the 'System' tenant.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM public.roles WHERE tenant_id = get_system_tenant_id()),
  p.id
FROM public.permissions p;

-- Assign permissions to the 'Owner' template role.
-- The Owner gets all permissions related to managing their tenant.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM public.roles WHERE name = 'Owner' AND tenant_id IS NULL),
  p.id
FROM public.permissions p
WHERE p.name LIKE 'db.tenants.%'
   OR p.name LIKE 'db.roles.%'
   OR p.name LIKE 'db.role_permissions.%'
   OR p.name LIKE 'db.tenant_users.%';

-- Assign permissions to the 'Member' template role.
-- Members can only see basic information about the tenant.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM public.roles WHERE name = 'Member' AND tenant_id IS NULL),
  p.id
FROM public.permissions p
WHERE p.name = 'db.tenants.select';



-- Helper function to check if the current user is a member of a specific tenant.
-- This will be used as a security check in other functions.
CREATE OR REPLACE FUNCTION is_tenant_member(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.tenant_users tu
        WHERE tu.tenant_id = p_tenant_id AND tu.user_id = auth.uid()
    );
$$;

-- Function to get members of a specific tenant.
-- It includes a security check to ensure the caller is a member of the tenant.
CREATE OR REPLACE FUNCTION get_tenant_members(p_tenant_id UUID)
RETURNS TABLE (
    tenant_id UUID,
    tenant_name TEXT,
    user_id UUID,
    user_email TEXT,
    user_avatar_url TEXT,
    user_raw_user_meta_data JSONB,
    role_id UUID,
    role_name TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Security Check: Only allow members of the tenant to see other members.
    IF NOT is_tenant_member(p_tenant_id) THEN
        RAISE EXCEPTION 'tenant:db.tenantMemberNotMember';
    END IF;

    RETURN QUERY
    SELECT
        tu.tenant_id,
        t.name AS tenant_name,
        tu.user_id,
        u.email::TEXT AS user_email,
        u.raw_user_meta_data->>'avatar_url' as user_avatar_url,
        u.raw_user_meta_data as user_raw_user_meta_data,
        tu.role_id,
        r.name as role_name,
        tu.created_at
    FROM
        public.tenant_users tu
    JOIN
        public.tenants t ON tu.tenant_id = t.id
    JOIN
        auth.users u ON tu.user_id = u.id
    JOIN
        public.roles r ON tu.role_id = r.id
    WHERE
        tu.tenant_id = p_tenant_id;
END;
$$;

-- Function to add a user to a tenant by their email.
-- Includes security checks for permissions.
CREATE OR REPLACE FUNCTION add_member_to_tenant_by_email(p_tenant_id UUID, p_user_email TEXT, p_role_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Security Check: Ensure the current user has permission to add members.
    -- This can be based on a specific permission, role, or tenant ownership.
    -- Here, we'll reuse the is_tenant_member check, assuming only members can add others.
    -- You could replace this with a more specific permission check if needed.
    IF NOT is_tenant_member(p_tenant_id) THEN
        RAISE EXCEPTION 'tenant:db.tenantMemberNoPermission';
    END IF;

    -- Find the user_id from the provided email
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;

    -- If user not found, raise an error
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'tenant:db.tenantMemberEmailNotFound';
    END IF;

    -- Insert the new member into the tenant_users table
    INSERT INTO public.tenant_users (tenant_id, user_id, role_id)
    VALUES (p_tenant_id, v_user_id, p_role_id);
END;
$$;

CREATE OR REPLACE FUNCTION create_role_with_permissions(
    p_tenant_id UUID,
    p_role_name TEXT,
    p_role_description TEXT,
    p_permission_ids UUID[]
)
RETURNS roles AS $$
DECLARE
    v_role roles;
    v_permission_id UUID;
BEGIN
    IF p_role_name IS NULL OR TRIM(p_role_name) = '' THEN
        RAISE EXCEPTION 'tenant:db.roleNameEmpty';
    END IF;

    -- 1. Create the new role
    INSERT INTO public.roles (tenant_id, name, description)
    VALUES (p_tenant_id, p_role_name, p_role_description)
    RETURNING * INTO v_role;

    -- 2. Grant permissions to the new role
    IF array_length(p_permission_ids, 1) > 0 THEN
        FOREACH v_permission_id IN ARRAY p_permission_ids
        LOOP
        -- Check if the user has permission to grant this permission
        IF can_grant_permission(v_role.id, v_permission_id) THEN
            INSERT INTO public.role_permissions (role_id, permission_id)
            VALUES (v_role.id, v_permission_id);
        ELSE
            RAISE EXCEPTION 'tenant:db.rolePermissionNoPermission';
        END IF;
        END LOOP;
    END IF;

    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- =====================================================================================
-- SECTION 8: FRAMEWORK TEARDOWN FUNCTION (FOR DEVELOPMENT/DEBUGGING)
-- =====================================================================================
--
-- This function drops all tables, functions, and other resources created by this script.
-- It's useful for a clean re-run during development.
--
CREATE OR REPLACE FUNCTION teardown_framework()
RETURNS VOID AS $$
BEGIN
  -- 1. Drop tables. The CASCADE option will also remove policies, triggers, and constraints.
  DROP TABLE IF EXISTS public.tenant_users CASCADE;
  DROP TABLE IF EXISTS public.role_permissions CASCADE;
  DROP TABLE IF EXISTS public.roles CASCADE;
  DROP TABLE IF EXISTS public.tenants CASCADE;
  DROP TABLE IF EXISTS public.permissions CASCADE;

  -- 2. Drop all functions created by this script.
  DROP FUNCTION IF EXISTS check_permission(TEXT);
  DROP FUNCTION IF EXISTS can_grant_permission(UUID, UUID);
  DROP FUNCTION IF EXISTS check_tenant_permission(UUID, TEXT, BOOLEAN);
  DROP FUNCTION IF EXISTS user_has_system_permission(UUID, TEXT);
  DROP FUNCTION IF EXISTS user_has_tenant_permission(UUID, UUID, TEXT, BOOLEAN);
  DROP FUNCTION IF EXISTS user_can_grant_permission(UUID, UUID, UUID);
  DROP FUNCTION IF EXISTS create_rls_policy(TEXT, TEXT, TEXT, TEXT);
  DROP FUNCTION IF EXISTS drop_rls_policy(TEXT, TEXT);
  DROP FUNCTION IF EXISTS add_updated_at_trigger(TEXT);
  DROP FUNCTION IF EXISTS remove_updated_at_trigger(TEXT);
  DROP FUNCTION IF EXISTS setup_rbac_rls(TEXT);
  DROP FUNCTION IF EXISTS teardown_rbac_rls(TEXT);
  DROP FUNCTION IF EXISTS create_tenant(TEXT);
  DROP FUNCTION IF EXISTS promote_user_to_admin(UUID);
  DROP FUNCTION IF EXISTS get_system_tenant_id();
  DROP FUNCTION IF EXISTS sync_role_permissions_tenant_id();
  DROP FUNCTION IF EXISTS handle_updated_at();
  DROP FUNCTION IF EXISTS is_tenant_member(UUID);
  DROP FUNCTION IF EXISTS get_tenant_members(UUID);
  DROP FUNCTION IF EXISTS add_member_to_tenant_by_email(UUID, TEXT, UUID);
  DROP FUNCTION IF EXISTS create_role_with_permissions(UUID, TEXT, TEXT, TEXT[]);
  DROP FUNCTION IF EXISTS teardown_framework();

  -- 3. Notices
  RAISE NOTICE 'Tenant-based framework teardown complete. You can re-run the init script.';
END;
$$ LANGUAGE plpgsql;
