using Newtonsoft.Json;

namespace Schwarzenegger.ViewModels
{
    public class NewPasswordObj
    {
        [JsonProperty("userId")]
        public string UserId;

        [JsonProperty("userId")]
        public string NewPassword;
    }
}
