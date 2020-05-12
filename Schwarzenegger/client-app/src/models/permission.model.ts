export type PermissionGroups = "Users" | "Roles" | "About";

export type PermissionNames =
  | "View Users"
  | "Add Users"
  | "Update Users"
  | "Delete Users"
  | "View Roles"
  | "Add Roles"
  | "Update Roles"
  | "Delete Roles"
  | "View About";

export type PermissionValues =
  | "users.view"
  | "users.add"
  | "users.update"
  | "users.delete"
  | "roles.view"
  | "roles.add"
  | "roles.update"
  | "roles.delete"
  | "about.view";

export class Permission {
  public static readonly viewUsersPermission: Permission = new Permission(
    "View Users",
    "users.view",
    "Users",
    "View Users"
  );
  public static readonly addUsersPermission: Permission = new Permission(
    "Add Users",
    "users.add",
    "Users",
    "Add Users"
  );
  public static readonly updateUsersPermission: Permission = new Permission(
    "Update Users",
    "users.update",
    "Users",
    "Update Users"
  );
  public static readonly deleteUsersPermission: Permission = new Permission(
    "Delete Users",
    "users.delete",
    "Users",
    "Delete Users"
  );

  public static readonly viewRolesPermission: Permission = new Permission(
    "View Roles",
    "roles.view",
    "Roles",
    "View Roles"
  );
  public static readonly addRolesPermission: Permission = new Permission(
    "Add Roles",
    "roles.add",
    "Roles",
    "Add Roles"
  );
  public static readonly updateRolesPermission: Permission = new Permission(
    "Update Roles",
    "roles.update",
    "Roles",
    "Update Roles"
  );
  public static readonly deleteRolesPermission: Permission = new Permission(
    "Delete Roles",
    "roles.delete",
    "Roles",
    "Delete Roles"
  );

  public static readonly viewAboutPermission: Permission = new Permission(
    "View About",
    "about.view",
    "About",
    "View About"
  );

  public static getAllPermissions(): Permission[] {
    return [
      this.viewUsersPermission,
      this.addUsersPermission,
      this.updateUsersPermission,
      this.deleteUsersPermission,
      this.viewRolesPermission,
      this.addRolesPermission,
      this.updateRolesPermission,
      this.deleteRolesPermission,
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
  public description: string;
}
