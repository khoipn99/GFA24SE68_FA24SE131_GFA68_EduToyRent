using EduToyRentAPI.Contracts.Login;
using EduToyRentRepositories.Models;
using EduToyRentAPI.JwtServices.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IJwtGeneratorTokenService _jwtGeneratorTokenService;

        public AuthController(IAuthService authService, IJwtGeneratorTokenService jwtGeneratorTokenService)
        {
            _authService = authService;
            _jwtGeneratorTokenService = jwtGeneratorTokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Contracts.Login.LoginRequest loginRequest)
        {
            var user = await _authService.Login(loginRequest);
            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            var token = _jwtGeneratorTokenService.GenerateToken(user);

            var response = new LoginResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                RoleId = user.RoleId,
                Token = token
            };

            return Ok(response);
        }
    }
}
