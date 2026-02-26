// نظام الأدوار والصلاحيات الشامل
export enum UserRole {
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  CLIENT = 'client', // للعرض فقط
}

export enum EmployeePermission {
  // Event Permissions
  EVENT_CREATE = 'event:create',
  EVENT_VIEW = 'event:view',
  EVENT_UPDATE = 'event:update',
  EVENT_DELETE = 'event:delete',
  EVENT_CLOSE = 'event:close',
  
  // Contact Permissions
  CONTACT_CREATE = 'contact:create',
  CONTACT_VIEW = 'contact:view',
  CONTACT_UPDATE = 'contact:update',
  CONTACT_DELETE = 'contact:delete',
  CONTACT_UPLOAD = 'contact:upload',
  
  // Invitation Permissions
  INVITATION_SEND = 'invitation:send',
  INVITATION_VIEW = 'invitation:view',
  
  // Guest Permissions
  GUEST_VIEW = 'guest:view',
  GUEST_UPDATE = 'guest:update',
  
  // Check-in Permissions
  CHECKIN_SCAN = 'checkin:scan',
  CHECKIN_VIEW = 'checkin:view',
  
  // Analytics Permissions
  ANALYTICS_VIEW = 'analytics:view',
  
  // Export Permissions
  EXPORT_CSV = 'export:csv',
  EXPORT_PDF = 'export:pdf',
  
  // WhatsApp Permissions
  WHATSAPP_SETTINGS = 'whatsapp:settings',
  WHATSAPP_SEND = 'whatsapp:send',
}

// أدوار الموظفين المحددة مسبقاً
export const PREDEFINED_ROLES = {
  EVENT_CREATOR: {
    name: 'Event Creator',
    nameAr: 'منشئ الفعاليات',
    permissions: [
      EmployeePermission.EVENT_CREATE,
      EmployeePermission.EVENT_VIEW,
      EmployeePermission.EVENT_UPDATE,
      EmployeePermission.CONTACT_VIEW,
      EmployeePermission.GUEST_VIEW,
      EmployeePermission.ANALYTICS_VIEW,
    ],
  },
  CONTACT_MANAGER: {
    name: 'Contact Manager',
    nameAr: 'مدير جهات الاتصال',
    permissions: [
      EmployeePermission.CONTACT_CREATE,
      EmployeePermission.CONTACT_VIEW,
      EmployeePermission.CONTACT_UPDATE,
      EmployeePermission.CONTACT_DELETE,
      EmployeePermission.CONTACT_UPLOAD,
      EmployeePermission.EVENT_VIEW,
    ],
  },
  INVITATION_SENDER: {
    name: 'Invitation Sender',
    nameAr: 'مرسل الدعوات',
    permissions: [
      EmployeePermission.EVENT_VIEW,
      EmployeePermission.CONTACT_VIEW,
      EmployeePermission.INVITATION_SEND,
      EmployeePermission.INVITATION_VIEW,
      EmployeePermission.GUEST_VIEW,
      EmployeePermission.WHATSAPP_SEND,
    ],
  },
  VIEWER: {
    name: 'Viewer',
    nameAr: 'مشاهد',
    permissions: [
      EmployeePermission.EVENT_VIEW,
      EmployeePermission.CONTACT_VIEW,
      EmployeePermission.GUEST_VIEW,
      EmployeePermission.ANALYTICS_VIEW,
    ],
  },
  CHECKIN_STAFF: {
    name: 'Check-in Staff',
    nameAr: 'موظف التسجيل',
    permissions: [
      EmployeePermission.EVENT_VIEW,
      EmployeePermission.GUEST_VIEW,
      EmployeePermission.CHECKIN_SCAN,
      EmployeePermission.CHECKIN_VIEW,
    ],
  },
  FULL_ACCESS: {
    name: 'Full Access',
    nameAr: 'صلاحيات كاملة',
    permissions: Object.values(EmployeePermission),
  },
} as const;

export type PredefinedRoleKey = keyof typeof PREDEFINED_ROLES;

// دالة للتحقق من الصلاحيات
export function hasPermission(
  userPermissions: EmployeePermission[],
  requiredPermission: EmployeePermission
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: EmployeePermission[],
  requiredPermissions: EmployeePermission[]
): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

export function hasAllPermissions(
  userPermissions: EmployeePermission[],
  requiredPermissions: EmployeePermission[]
): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}
