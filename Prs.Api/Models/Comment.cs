using System.ComponentModel.DataAnnotations;

namespace Prs.Api.Models {
    public class Comment {
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Body { get; set; } = string.Empty;

        public int RequestId { get; set; }
        public virtual Request? Request { get; set; }

        public int UserId { get; set; }
        public virtual User? User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}