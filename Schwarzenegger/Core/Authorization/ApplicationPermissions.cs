using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Schwarzenegger.Core.Authorization
{
    public static class ApplicationPermissions
    {
        public const string UsersPermissionGroupName = "User Permissions";

        public const string RolesPermissionGroupName = "Role Permissions";
        public static ReadOnlyCollection<ApplicationPermission> AllPermissions;

        public static ApplicationPermission ViewUsers = new ApplicationPermission("View Users", "users.view",
            UsersPermissionGroupName, "Permission to view other users account details");

        public static ApplicationPermission ManageUsers = new ApplicationPermission("Manage Users", "users.manage",
            UsersPermissionGroupName, "Permission to create, delete and modify other users account details");

        public static ApplicationPermission ViewRoles = new ApplicationPermission("View Roles", "roles.view",
            RolesPermissionGroupName, "Permission to view available roles");

        public static ApplicationPermission ManageRoles = new ApplicationPermission("Manage Roles", "roles.manage",
            RolesPermissionGroupName, "Permission to create, delete and modify roles");

        public static ApplicationPermission AssignRoles = new ApplicationPermission("Assign Roles", "roles.assign",
            RolesPermissionGroupName, "Permission to assign roles to users");


        public static ApplicationPermission ViewHome = new ApplicationPermission("View Home", "home.view",
            UsersPermissionGroupName, "Permission to view Home");


        public static ApplicationPermission ViewAbout = new ApplicationPermission("View About", "about.view",
            UsersPermissionGroupName, "Permission to view About");


        public static ApplicationPermission ViewAccount = new ApplicationPermission("View Account", "account.view",
            UsersPermissionGroupName, "Permission to view my Account");


        static ApplicationPermissions()
        {
            var allPermissions = new List<ApplicationPermission>
            {
                ViewUsers,
                ManageUsers,

                ViewRoles,
                ManageRoles,
                AssignRoles,

                ViewHome,
                ViewAbout,
                ViewAccount
            };

            AllPermissions = allPermissions.AsReadOnly();
        }

        public static ApplicationPermission GetPermissionByName(string permissionName)
        {
            return AllPermissions.Where(p => p.Name == permissionName).SingleOrDefault();
        }

        public static ApplicationPermission GetPermissionByValue(string permissionValue)
        {
            return AllPermissions.Where(p => p.Value == permissionValue).SingleOrDefault();
        }
        
        public static string[] GetAllPermissionValues()
        {
            return AllPermissions.Select(p => p.Value).ToArray();
        }

        public static string[] GetAdministrativePermissionValues()
        {
            return new string[] {ManageUsers, ManageRoles, AssignRoles};
        }
    }


    public class ApplicationPermission
    {
        public ApplicationPermission(string name, string value, string groupName, string description = null)
        {
            Name = name;
            Value = value;
            GroupName = groupName;
            Description = description;
        }


        public string Name { get; set; }
        public string Value { get; set; }
        public string GroupName { get; set; }
        public string Description { get; set; }


        public override string ToString()
        {
            return Value;
        }


        public static implicit operator string(ApplicationPermission permission)
        {
            return permission.Value;
        }
    }
}