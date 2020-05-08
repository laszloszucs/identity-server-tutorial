using Schwarzenegger.Core.Authorization;

namespace Schwarzenegger.ViewModels
{
    public class PermissionViewModel
    {
        public string Name { get; set; }
        public string Value { get; set; }


        public static explicit operator PermissionViewModel(ApplicationPermission permission)
        {
            return new PermissionViewModel
            {
                Name = permission.Name,
                Value = permission.Value
            };
        }
    }
}