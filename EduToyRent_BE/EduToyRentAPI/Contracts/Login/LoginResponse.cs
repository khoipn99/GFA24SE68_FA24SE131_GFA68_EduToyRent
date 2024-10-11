using EduToyRentRepositories.Models;

namespace EduToyRentAPI.Contracts.Login
{
    public class LoginResponse
    {
        public User UserAccount { get; set; }
        public string Token { get; set; }
    }
}
