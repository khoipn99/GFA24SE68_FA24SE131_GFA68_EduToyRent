using EduToyRentAPI.Contracts.Login;
using EduToyRentRepositories.Models;
using EduToyRentAPI.JwtServices.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using EduToyRentAPI.GmailService;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.DTO.Request;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IJwtGeneratorTokenService _jwtGeneratorTokenService;
        private readonly IMailService _mailService;
        private readonly IMemoryCache _memoryCache;
        private readonly IUnitOfWork _unitOfWork;

        public AuthController(
            IAuthService authService,
            IJwtGeneratorTokenService jwtGeneratorTokenService,
            IMailService mailService,
            IMemoryCache memoryCache,
            IUnitOfWork unitOfWork)
        {
            _authService = authService;
            _jwtGeneratorTokenService = jwtGeneratorTokenService;
            _mailService = mailService;
            _memoryCache = memoryCache;
            _unitOfWork = unitOfWork;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Contracts.Login.LoginRequest loginRequest)
        {
            var user = await _authService.Login(loginRequest);
            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }
            if (!string.Equals(user.Status, "Active", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized("Your account is not active. Please contact support.");
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


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _authService.GetUserByEmail(request.Email);
            if (user == null)
                return NotFound("Email không tồn tại.");

            var otp = new Random().Next(100000, 999999).ToString();
            _memoryCache.Set($"resetpassword_{user.Email}", otp, TimeSpan.FromMinutes(5));

            await _mailService.SendEmailAsync(user.Email, "Mã OTP khôi phục mật khẩu",
                $"{otp}");

            return Ok("OTP đã được gửi đến email của bạn.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _authService.GetUserByEmail(request.Email);
            if (user == null)
                return NotFound("Email không tồn tại.");

            if (!_memoryCache.TryGetValue($"resetpassword_{user.Email}", out string cachedOtp))
            {
                return BadRequest("Không tìm thấy OTP hoặc OTP đã hết hạn.");
            }

            if (cachedOtp != request.OTP)
            {
                return BadRequest("OTP không chính xác.");
            }

            user.Password = request.NewPassword;
            _unitOfWork.UserRepository.Update(user);
            _unitOfWork.Save();

            _memoryCache.Remove($"resetpassword_{user.Email}");

            return Ok("Mật khẩu đã được cập nhật thành công.");
        }
    }
}
