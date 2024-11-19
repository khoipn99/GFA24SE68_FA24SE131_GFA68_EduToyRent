using EduToyRentRepositories.Models;

namespace EduToyRentAPI.Contracts.Login
{
    public class LoginResponse
    {
        public int UserId { get; set; }
        public string Email { get; set; }
        public int RoleId { get; set; }
        public string FullName { get; set; }
        //public User UserAccount { get; set; }
        public string Token { get; set; }
    }
}
