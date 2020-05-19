using System.Collections.Generic;

namespace Schwarzenegger.Helpers
{
    public class AppSettings
    {
        public SmtpConfig SmtpConfig { get; set; }
        public string[] AllowedCorsOrigins { get; set; }
    }

    public class SmtpConfig
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public bool UseSsl { get; set; }
        public string Name { get; set; }
        public string Username { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
    }
}