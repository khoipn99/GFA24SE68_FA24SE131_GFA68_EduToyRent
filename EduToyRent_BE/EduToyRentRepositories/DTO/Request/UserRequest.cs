using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduToyRentRepositories.DTO.Request
{
    public class UserRequest
    {
        [Required]
        public string FullName { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public DateTime CreateDate { get; set; }
        [Required]
        public string Phone { get; set; }
        [Required]
        public DateTime Dob { get; set; }
        [Required]
        public string Address { get; set; }
        public string AvatarUrl { get; set; }
        [Required]
        public string Status { get; set; }
    }
}
