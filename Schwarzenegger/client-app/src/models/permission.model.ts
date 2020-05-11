export type PermissionGroups = "Users" | "Roles" | "About";

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
  public static readonly viewUsersPermission: Permission = new Permission("View Users", "users.view", "Users", "View Users");
  public static readonly manageUsersPermission: Permission = new Permission("Manage Users", "users.manage", "Users", "Manage Users");
  
  public static readonly viewRolesPermission: Permission = new Permission("View Roles", "roles.view", "Roles", "View Roles");
  public static readonly manageRolesPermission: Permission = new Permission("Manage Roles", "roles.manage", "Roles", "Manage Roles");
  
  public static readonly viewAboutPermission: Permission = new Permission("View About", "about.view", "About", "View About");

  public static getAllPermissions(): Permission[] {
    return [
      this.viewUsersPermission,
      this.manageUsersPermission,
      this.viewRolesPermission,
      this.manageRolesPermission,
      this.viewAboutPermission
    ];
  }

  constructor(
    name?: PermissionNames,
    value?: PermissionValues,
    groupName?: PermissionGroups,
    description?: PermissionNames
  ) {
    this.name = name;
    this.value = value;
    this.groupName = groupName;
    this.description = description;
  }

  public name: PermissionNames;
  public value: PermissionValues;
  public groupName: PermissionGroups;
  public description: PermissionNames; // TODO Ez csak ideiglenes
}
