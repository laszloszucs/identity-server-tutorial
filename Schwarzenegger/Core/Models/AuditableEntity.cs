using System;
using System.ComponentModel.DataAnnotations;

namespace Schwarzenegger.Core.Models
{
    public class AuditableEntity
    {
        [MaxLength(256)] public string CreatedBy { get; set; }

        [MaxLength(256)] public string UpdatedBy { get; set; }

        public DateTime UpdatedDate { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}