using EduToyRentRepositories.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("total")]
        public ActionResult GetTotal()
        {
            var totalUsers = _unitOfWork.UserRepository.Get().ToList().Count;
            var totalOrders = _unitOfWork.OrderRepository.Get().ToList().Count;
            var totalToys = _unitOfWork.ToyRepository.Get().ToList().Count;
            var totalRevenue = _unitOfWork.TransactionRepository.Get().Sum(transaction => transaction.PlatformFee);

            return Ok(new
            {
                totalUsers = totalUsers,
                totalOrders = totalOrders,
                totalToys = totalToys,
                totalRevenue = totalRevenue
            });
        }

        [HttpGet("revenue")]
        public ActionResult GetRevenue()
        {
            var totalRevenue = _unitOfWork.TransactionRepository.Get()
                .Sum(transaction => transaction.PlatformFee);

            var totalRentRevenue = _unitOfWork.TransactionRepository.Get()
                .Where(transaction => transaction.DepositBackMoney > 0)
                .Sum(transaction => transaction.PlatformFee);

            var totalBuyRevenue = _unitOfWork.TransactionRepository.Get()
                .Where(transaction => transaction.DepositBackMoney == 0)
                .Sum(transaction => transaction.PlatformFee);

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalRentRevenue = totalRentRevenue,
                TotalBuyRevenue = totalBuyRevenue
            });
        }

        [HttpGet("revenue-by-time")]
        public ActionResult GetRevenueByTime(DateTime? startDate, DateTime? endDate, bool? isMonth)
        {
            var transactions = _unitOfWork.TransactionRepository.Get();

            if (startDate == null || endDate == null)
            {
                var today = DateTime.Today;

                if (isMonth == true)
                {
                    startDate = new DateTime(today.Year, today.Month, 1); //1st day of month
                    endDate = startDate.Value.AddMonths(1).AddDays(-1); //last day of month
                }
                else
                {
                    startDate = today.AddDays(-(int)today.DayOfWeek + 1); //Mon
                    endDate = startDate.Value.AddDays(6); //Sun
                }               
            }

            var totalRevenue = transactions
                .Where(transaction => transaction.Date >= startDate && transaction.Date <= endDate)
                .Sum(transaction => transaction.PlatformFee);

            var totalRentRevenue = transactions
                .Where(transaction => transaction.DepositBackMoney > 0 &&
                                      transaction.Date >= startDate && transaction.Date <= endDate)
                .Sum(transaction => transaction.PlatformFee);

            var totalBuyRevenue = transactions
                .Where(transaction => transaction.DepositBackMoney == 0 &&
                                      transaction.Date >= startDate && transaction.Date <= endDate)
                .Sum(transaction => transaction.PlatformFee);

            return Ok(new
            {
                StartDate = startDate.Value.ToString("yyyy-MM-dd"),
                EndDate = endDate.Value.ToString("yyyy-MM-dd"),
                TotalRevenue = totalRevenue,
                TotalRentRevenue = totalRentRevenue,
                TotalBuyRevenue = totalBuyRevenue
            });
        }
    }

}
