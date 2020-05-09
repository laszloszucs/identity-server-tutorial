
export type PermissionGroups =
| "Users"
| "Roles"
| "About";

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
| null
| "users.view"
| "users.manage"
| "roles.view"
| "roles.manage"
| "roles.assign"
| "home.view"
| "about.view"
| "account.view";


interface PermissionType {
  group: PermissionGroups,
  values: PermissionValueTypes[]
}

interface PermissionValueTypes {
  name: PermissionValueType, 
  value: PermissionValues
}

export type PermissionValueType =
  | "None"
  | "View Only"
  | "Manage";  

export class Permission {
  public static readonly usersPermission: PermissionType = {
    group: "Users",
    values: [
      {
        name: "None",
        value: null
      },
      {
        name: "View Only",
        value: "users.view"
      },
      {
        name: "Manage",
        value: "users.manage"
      }
    ],
  };

  public static readonly rolesPermission: PermissionType = {
    group: "Roles",
    values: [
      {
        name: "None",
        value: null
      },
      {
        name: "View Only",
        value: "roles.view"
      },
      {
        name: "Manage",
        value: "roles.manage"
      }
    ],
  };

  public static readonly aboutPermission: PermissionType = {
    group: "About",
    values: [
      {
        name: "None",
        value: null
      },
      {
        name: "View Only",
        value: "about.view"
      }
    ],
  };

  public static getAllPermissions(): PermissionType[] {
    return [
      this.usersPermission,
      this.rolesPermission,
      this.aboutPermission,
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
