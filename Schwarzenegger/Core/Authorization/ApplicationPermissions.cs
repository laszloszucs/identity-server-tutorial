using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Schwarzenegger.Core.Authorization
{
    public static class ApplicationPermissions
    {
        public const string UsersPermissionGroupName = "User Permissions";
        public const string RolesPermissionGroupName = "Role Permissions";
        public const string AboutPermissionGroupName = "About Permissions";
        public static ReadOnlyCollection<ApplicationPermission> AllPermissions;

        public static ApplicationPermission ViewUsers = new ApplicationPermission("View Users", "users.view",
            UsersPermissionGroupName, "Permission to view other users account details");
        public static ApplicationPermission AddUsers = new ApplicationPermission("Add Users", "users.add",
            UsersPermissionGroupName, "Add Users");
        public static ApplicationPermission UpdateUsers = new ApplicationPermission("Update Users", "users.update",
            UsersPermissionGroupName, "Update Users");
        public static ApplicationPermission DeleteUsers = new ApplicationPermission("Delete Users", "users.delete",
            UsersPermissionGroupName, "Delete Users");

        public static ApplicationPermission ViewRoles = new ApplicationPermission("View Roles", "roles.view",
            RolesPermissionGroupName, "Permission to view available roles");
        public static ApplicationPermission AddRoles = new ApplicationPermission("Add Roles", "roles.add",
            RolesPermissionGroupName, "Add Roles");
        public static ApplicationPermission UpdateRoles = new ApplicationPermission("Update Roles", "roles.update",
            RolesPermissionGroupName, "Update Roles");
        public static ApplicationPermission DeleteRoles = new ApplicationPermission("Delete Roles", "roles.delete",
            RolesPermissionGroupName, "Delete Roles");

        public static ApplicationPermission ViewAbout = new ApplicationPermission("View About", "about.view",
            AboutPermissionGroupName, "Permission to view About");
        
        static ApplicationPermissions()
        {
            var allPermissions = new List<ApplicationPermission>
            {
                ViewUsers,
                AddUsers,
                UpdateUsers,
                DeleteUsers,
                ViewRoles,
                AddRoles,
                UpdateRoles,
                DeleteRoles,
                ViewAbout,
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