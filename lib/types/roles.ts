// Role-Based Access Control Types

export enum UserRole {
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export enum EmployeePermission {
  EVENT_CREATE = 'event_create',
  EVENT_EDIT = 'event_edit',
  EVENT_DELETE = 'event_delete',
  EVENT_VIEW = 'event_view',
  
  CONTACT_CREATE = 'contact_create',
  CONTACT_EDIT = 'contact_edit',
  CONTACT_DELETE = 'contact_delete',
  CONTACT_VIEW = 'contact_view',
  CONTACT_IMPORT = 'contact_import',
  
  INVITATION_SEND = 'invitation_send',
  INVITATION_VIEW = 'invitation_view',
  
  GUEST_VIEW = 'guest_view',
  GUEST_EDIT = 'guest_edit',
  
  CHECKIN_SCAN = 'checkin_scan',
  CHECKIN_VIEW = 'checkin_view',
  
  ANALYTICS_VIEW = 'analytics_view',
  
  USER_MANAGE = 'user_manage',
  
  SETTINGS_VIEW = 'settings_view',
  SETTINGS_EDIT = 'settings_edit',
}

// Permission groups for easy assignment
export const PERMISSION_GROUPS = {
  event_creator: [
    EmployeePermission.EVENT_CREATE,
    EmployeePermission.EVENT_EDIT,
    EmployeePermission.EVENT_VIEW,
    EmployeePermission.GUEST_VIEW,
    EmployeePermission.ANALYTICS_VIEW,
  ],
  contact_manager: [
    EmployeePermission.CONTACT_CREATE,
    EmployeePermission.CONTACT_EDIT,
    EmployeePermission.CONTACT_DELETE,
    EmployeePermission.CONTACT_VIEW,
    EmployeePermission.CONTACT_IMPORT,
  ],
  invitation_sender: [
    EmployeePermission.INVITATION_SEND,
    EmployeePermission.INVITATION_VIEW,
    EmployeePermission.EVENT_VIEW,
    EmployeePermission.GUEST_VIEW,
  ],
  viewer: [
    EmployeePermission.EVENT_VIEW,
    EmployeePermission.GUEST_VIEW,
    EmployeePermission.CONTACT_VIEW,
    EmployeePermission.INVITATION_VIEW,
    EmployeePermission.ANALYTICS_VIEW,
  ],
  checkin_staff: [
    EmployeePermission.CHECKIN_SCAN,
    EmployeePermission.CHECKIN_VIEW,
    EmployeePermission.EVENT_VIEW,
    EmployeePermission.GUEST_VIEW,
  ],
};

// Manager has all permissions
export const MANAGER_PERMISSIONS = Object.values(EmployeePermission);
