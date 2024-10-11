using EduToyRentRepositories.Models;

namespace EduToyRentAPI.JwtServices.IServices
{
    public interface IJwtGeneratorTokenService
    {
        string GenerateToken(User user);
    }
}
