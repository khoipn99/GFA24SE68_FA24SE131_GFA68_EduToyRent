using EduToyRentRepositories.Models;
using EduToyRentAPI.Contracts.Login;
using EduToyRentAPI.JwtServices.IServices;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Interface;

namespace EduToyRentAPI.JwtServices
{
    public class AuthService : IAuthService
    {
        private readonly EduToyRentDBContext _context;
        private readonly IJwtGeneratorTokenService _jwtGeneratorTokenService;
        private readonly IUnitOfWork _unitOfWork;
        public AuthService(EduToyRentDBContext context, IJwtGeneratorTokenService jwtGeneratorTokenService, IUnitOfWork unitOfWork)
        {
            _context = context;
            _jwtGeneratorTokenService = jwtGeneratorTokenService;
            _unitOfWork = unitOfWork;
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
        public async Task<User> GetUserByEmail(string email)
        {
            return _unitOfWork.UserRepository.GetV2(u => u.Email.ToLower() == email.ToLower()).FirstOrDefault();
        }
    }
}
