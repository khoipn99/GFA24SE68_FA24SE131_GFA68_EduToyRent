using EduToyRentRepositories.Models;
using EduToyRentAPI.Contracts.Login;
using EduToyRentAPI.JwtServices.IServices;
using Microsoft.EntityFrameworkCore;

namespace EduToyRentAPI.JwtServices
{
    public class AuthService : IAuthService
    {
        private readonly EduToyRentDBContext _context;
        private readonly IJwtGeneratorTokenService _jwtGeneratorTokenService;

        public AuthService(EduToyRentDBContext context, IJwtGeneratorTokenService jwtGeneratorTokenService)
        {
            _context = context;
            _jwtGeneratorTokenService = jwtGeneratorTokenService;
        }

        public async Task<User> Login(LoginRequest loginRequest)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginRequest.Email && u.Password == loginRequest.Password);
            if (user == null)
            {
                return null;
            }

            return user;
        }
    }
}
