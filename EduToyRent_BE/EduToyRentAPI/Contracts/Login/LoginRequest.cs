﻿using System.ComponentModel.DataAnnotations;

namespace EduToyRentAPI.Contracts.Login
{
    public class LoginRequest
    {
        [Required]
        public string? Email { get; set; }
        [Required]
        public string? Password { get; set; }
    }
}
