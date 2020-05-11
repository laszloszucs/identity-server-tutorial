namespace Schwarzenegger.Core.Authorization
{
    public class Policies
    {
        public const string ViewUsersPolicy = "View Users";
        public const string AddUsersPolicy = "Add Users";
        public const string UpdateUsersPolicy = "Add Users";
        public const string DeleteUsersPolicy = "Delete Users";

        public const string ViewRolesPolicy = "View Roles";
        public const string AddRolesPolicy = "Add Roles";
        public const string UpdateRolesPolicy = "Add Roles";
        public const string DeleteRolesPolicy = "Delete Roles";

        public const string ViewAboutPolicy = "View About";
    }


    /// <summary>
    ///     Operation Policy to allow adding, viewing, updating and deleting general or specific user records.
    /// </summary>
    public static class AccountManagementOperations
    {
        public const string CreateOperationName = "Create";
        public const string ReadOperationName = "Read";
        public const string UpdateOperationName = "Update";
        public const string DeleteOperationName = "Delete";

        public static UserAccountAuthorizationRequirement Create =
            new UserAccountAuthorizationRequirement(CreateOperationName);

        public static UserAccountAuthorizationRequirement Read =
            new UserAccountAuthorizationRequirement(ReadOperationName);

        public static UserAccountAuthorizationRequirement Update =
            new UserAccountAuthorizationRequirement(UpdateOperationName);

        public static UserAccountAuthorizationRequirement Delete =
            new UserAccountAuthorizationRequirement(DeleteOperationName);
    }
}