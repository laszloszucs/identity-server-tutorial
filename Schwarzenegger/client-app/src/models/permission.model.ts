export type PermissionNames =
  | "View Users"
  | "Manage Users"
  | "View Roles"
  | "Manage Roles"
  | "Assign Roles"
  | "View Homes"
  | "View About"
  | "View Account";

export type PermissionValues =
  | "users.view"
  | "users.manage"
  | "roles.view"
  | "roles.manage"
  | "roles.assign"
  | "home.view"
  | "about.view"
  | "account.view";

export class Permission {
  public static readonly viewUsersPermission: PermissionValues = "users.view";

  public static readonly manageUsersPermission: PermissionValues =
    "users.manage";

  public static readonly viewRolesPermission: PermissionValues = "roles.view";

  public static readonly manageRolesPermission: PermissionValues =
    "roles.manage";

  public static readonly assignRolesPermission: PermissionValues =
    "roles.assign";

  public static readonly viewHomePermission: PermissionValues = "home.view";

  public static readonly viewAboutPermission: PermissionValues = "about.view";

  public static readonly viewAccountPermission: PermissionValues =
    "account.view";

  public static readonly viewUsers: any = {
    value: Permission.viewUsersPermission,
    name: "View Users"
  };

  public static readonly manageUsers: any = {
    value: Permission.manageUsersPermission,
    name: "Manage Users"
  };

  public static readonly viewRoles: any = {
    value: Permission.viewRolesPermission,
    name: "View Roles"
  };

  public static readonly manageRoles: any = {
    value: Permission.manageRolesPermission,
    name: "Manage Roles"
  };

  public static readonly assignRoles: any = {
    value: Permission.assignRolesPermission,
    name: "Assign Roles"
  };

  public static readonly viewHome: any = {
    value: Permission.viewHomePermission,
    name: "View Home"
  };

  public static readonly viewAbout: any = {
    value: Permission.viewAboutPermission,
    name: "View About"
  };

  public static readonly viewAccount: any = {
    value: Permission.viewAccountPermission,
    name: "View Account"
  };

  public static getAllPermissionValues(): string[] {
    return [
      this.viewUsersPermission,
      this.manageUsersPermission,
      this.viewRolesPermission,
      this.manageRolesPermission,
      this.assignRolesPermission,
      this.viewHomePermission,
      this.viewAboutPermission,
      this.viewAccountPermission
    ];
  }

  public static getAllPermissions(): any[] {
    return [
      this.viewUsers,
      this.manageUsers,
      this.viewRoles,
      this.manageRoles,
      this.assignRoles,
      this.viewHome,
      this.viewAbout,
      this.viewAccount
    ];
  }

  constructor(
    name?: PermissionNames,
    value?: PermissionValues,
    groupName?: string,
    description?: string
  ) {
    this.name = name;
    this.value = value;
    this.groupName = groupName;
    this.description = description;
  }

  public name: PermissionNames;
  public value: PermissionValues;
  public groupName: string;
  public description: string;
}
