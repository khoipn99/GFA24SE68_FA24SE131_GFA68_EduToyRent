using EduToyRentRepositories.Models;
using EduToyRentAPI.Contracts.Login;

namespace EduToyRentAPI.JwtServices.IServices
{
    public interface IAuthService
    {
        Task<User> Login(LoginRequest loginRequest);
    }
}
