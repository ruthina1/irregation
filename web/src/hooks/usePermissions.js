import { useAuthStore } from '../store/authStore';

export const usePermissions = () => {
  const { user } = useAuthStore();
  
  // Extract flat array of permission strings provided by our AuthService fix
  const userPermissions = user?.permission_list || [];
  
  // We still extract roles just to display the badge in the UI and handle SuperAdmin bypass
  const userRoles = user?.roles?.map(r => r.name) || [];
  const primaryRole = userRoles[0] || 'Unauthorized';
  const isSuperAdmin = userRoles.includes('SuperAdmin');

  /**
   * Enterprise Permission Check
   * @param {string[]} requiredPermissions - Array of permissions allowed to access the resource
   * @returns {boolean}
   */
  const hasPermission = (requiredPermissions) => {
    // 1. If no permissions required, it's public/open
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    
    // 2. Enterprise Standard: SuperAdmin bypasses all permission checks naturally
    if (isSuperAdmin) return true; 

    // 3. Check if user has ANY of the required permissions for this UI element
    return requiredPermissions.some(perm => userPermissions.includes(perm));
  };

  return { primaryRole, hasPermission, isSuperAdmin };
};