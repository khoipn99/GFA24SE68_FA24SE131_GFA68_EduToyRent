using EduToyRentAPI.FireBaseService;
using EduToyRentRepositories.DTO.Request;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using Humanizer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Drawing.Printing;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFireBaseService _fireBaseService;
        public ReportsController(IUnitOfWork unitOfWork, IFireBaseService fireBaseService)
        {
            _unitOfWork = unitOfWork;
            _fireBaseService = fireBaseService;
        }

        // GET: api/Reports
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<ReportResponse>> GetReports(int pageIndex = 1, int pageSize = 20)
        {
            var reports = _unitOfWork.ReportRepository.Get(
                includeProperties: "User,OrderDetail.Toy,User.Role",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(r => r.Id);
            var reportResponse = reports.Select(report => {
                var mediaList = _unitOfWork.MediaRepository
                    .GetV2(m => m.ToyId == report.OrderDetail.ToyId)
                    .Select(m => m.MediaUrl)
                    .ToList();
                var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == report.OrderDetailId)
                    .Select(m => m.MediaUrl)
                    .ToList();
                var OrderCheckSatusList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == report.OrderDetail.OrderId)
                    .Select(m => m.Status)
                    .ToList();
                return new ReportResponse
                {
                    Id = report.Id,
                    VideoUrl = report.VideoUrl,
                    Description = report.Description,
                    Status = report.Status,
                    OrderDetailId = report.OrderDetailId,
                    OrderDetail = new OrderDetailResponse
                    {
                        Id = report.OrderDetail.Id,
                        OrderId = report.OrderDetail.OrderId,
                        RentPrice = (int)report.OrderDetail.RentPrice,
                        UnitPrice = report.OrderDetail.UnitPrice,
                        Quantity = report.OrderDetail.Quantity,
                        Deposit = (int)report.OrderDetail.Deposit,
                        StartDate = report.OrderDetail.StartDate,
                        EndDate = report.OrderDetail.EndDate,
                        Fine = report.OrderDetail.Fine,
                        RentCount = report.OrderDetail.RentCount,
                        OrderTypeId = report.OrderDetail.OrderTypeId,
                        RatingId = report.OrderDetail.RatingId,
                        Status = report.OrderDetail.Status,
                        ToyId = report.OrderDetail.ToyId,
                        ToyName = report.OrderDetail.Toy.Name,
                        ToyImgUrls = mediaList,
                        OrderCheckImageUrl = OrderCheckImageList,
                        OrderCheckStatus = OrderCheckSatusList
                    },
                    UserId = report.UserId,
                    User = new UserResponse
                    {
                        Id = report.UserId,
                        FullName = report.User.FullName,
                        Email = report.User.Email,
                        CreateDate = report.User.CreateDate,
                        Phone = report.User.Phone,
                        Dob = report.User.Dob ?? DateTime.MinValue,
                        Address = report.User.Address,
                        AvatarUrl = report.User.AvatarUrl,
                        Description = report.User.Description,
                        Star = report.User.Star ?? 0,
                        Status = report.User.Status,
                        Role = new RoleResponse
                        {
                            Id = report.User.Role.Id,
                            Name = report.User.Role.Name
                        },
                        WalletId = report.User.WalletId,
                    }
                };
        }).ToList();

            return Ok(reportResponse);
        }

        // GET: api/Reports/5
        [HttpGet("{id}")]
        [EnableQuery]
        public ActionResult<ReportResponse> GetReport(int id)
        {
            var report = _unitOfWork.ReportRepository.Get(
                includeProperties: "User,OrderDetail.Toy,User.Role",
                filter: r => r.Id == id)
                .FirstOrDefault();
            if (report == null)
            {
                return NotFound();
            }

            var mediaList = _unitOfWork.MediaRepository
                     .GetV2(m => m.ToyId == report.OrderDetail.ToyId)
                     .Select(m => m.MediaUrl)
                     .ToList();
            var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                .GetV2(m => m.OrderDetailId == report.OrderDetailId)
                .Select(m => m.MediaUrl)
                .ToList();
            var OrderCheckSatusList = _unitOfWork.OrderCheckImageRepository
                .GetV2(m => m.OrderDetailId == report.OrderDetail.OrderId)
                .Select(m => m.Status)
                .ToList();
            var reportResponse =  new ReportResponse
            {
                Id = report.Id,
                VideoUrl = report.VideoUrl,
                Description = report.Description,
                Status = report.Status,
                OrderDetailId = report.OrderDetailId,
                OrderDetail = new OrderDetailResponse
                {
                    Id = report.OrderDetail.Id,
                    OrderId = report.OrderDetail.OrderId,
                    RentPrice = (int)report.OrderDetail.RentPrice,
                    UnitPrice = report.OrderDetail.UnitPrice,
                    Quantity = report.OrderDetail.Quantity,
                    Deposit = (int)report.OrderDetail.Deposit,
                    StartDate = report.OrderDetail.StartDate,
                    EndDate = report.OrderDetail.EndDate,
                    Fine = report.OrderDetail.Fine,
                    RentCount = report.OrderDetail.RentCount,
                    OrderTypeId = report.OrderDetail.OrderTypeId,
                    RatingId = report.OrderDetail.RatingId,
                    Status = report.OrderDetail.Status,
                    ToyId = report.OrderDetail.ToyId,
                    ToyName = report.OrderDetail.Toy.Name,
                    ToyImgUrls = mediaList,
                    OrderCheckImageUrl = OrderCheckImageList,
                    OrderCheckStatus = OrderCheckSatusList
                },
                UserId = report.UserId,
                User = new UserResponse
                {
                    Id = report.UserId,
                    FullName = report.User.FullName,
                    Email = report.User.Email,
                    CreateDate = report.User.CreateDate,
                    Phone = report.User.Phone,
                    Dob = report.User.Dob ?? DateTime.MinValue,
                    Address = report.User.Address,
                    AvatarUrl = report.User.AvatarUrl,
                    Description = report.User.Description,
                    Star = report.User.Star ?? 0,
                    Status = report.User.Status,
                    Role = new RoleResponse
                    {
                        Id = report.User.Role.Id,
                        Name = report.User.Role.Name
                    },
                    WalletId = report.User.WalletId,
                }
            };

            return Ok(reportResponse);
        }

        // PUT: api/Reports/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReport(ReportRequest reportRequest, int id)
        {
            var report = _unitOfWork.ReportRepository.GetByID(id);

            report.VideoUrl = reportRequest.VideoUrl;
            report.Description = reportRequest.Description;
            report.Status = reportRequest.Status;
            report.OrderDetailId = reportRequest.OrderDetailId;
            report.UserId = reportRequest.UserId;

            _unitOfWork.ReportRepository.Update(report);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_unitOfWork.ReportRepository.GetV2().Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }


        // POST: api/Reports
        [HttpPost]
        [EnableQuery]
        public async Task<ActionResult<ReportResponse>> PostReport(ReportRequest reportRequest)
        {
            
            var report = new Report
            {
                VideoUrl = reportRequest.VideoUrl,
                Description = reportRequest.Description,
                Status = reportRequest.Status,
                OrderDetailId = reportRequest.OrderDetailId,
                UserId = reportRequest.UserId
            };

            _unitOfWork.ReportRepository.Insert(report);
            _unitOfWork.Save();

            var createdReport = _unitOfWork.ReportRepository.Get(
                includeProperties: "User,OrderDetail.Toy,User.Role",
                filter: r => r.Id == report.Id).FirstOrDefault();

            if (createdReport == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Failed to retrieve the created report" });
            }

            var mediaList = _unitOfWork.MediaRepository
                     .GetV2(m => m.ToyId == report.OrderDetail.ToyId)
                     .Select(m => m.MediaUrl)
                     .ToList();
            var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                .GetV2(m => m.OrderDetailId == report.OrderDetailId)
                .Select(m => m.MediaUrl)
                .ToList();
            var OrderCheckSatusList = _unitOfWork.OrderCheckImageRepository
                .GetV2(m => m.OrderDetailId == report.OrderDetail.OrderId)
                .Select(m => m.Status)
                .ToList();
            var reportResponse = new ReportResponse
            {
                Id = report.Id,
                VideoUrl = report.VideoUrl,
                Description = report.Description,
                Status = report.Status,
                OrderDetailId = report.OrderDetailId,
                OrderDetail = new OrderDetailResponse
                {
                    Id = report.OrderDetail.Id,
                    OrderId = report.OrderDetail.OrderId,
                    RentPrice = (int)report.OrderDetail.RentPrice,
                    UnitPrice = report.OrderDetail.UnitPrice,
                    Quantity = report.OrderDetail.Quantity,
                    Deposit = (int)report.OrderDetail.Deposit,
                    StartDate = report.OrderDetail.StartDate,
                    EndDate = report.OrderDetail.EndDate,
                    Fine = report.OrderDetail.Fine,
                    RentCount = report.OrderDetail.RentCount,
                    OrderTypeId = report.OrderDetail.OrderTypeId,
                    RatingId = report.OrderDetail.RatingId,
                    Status = report.OrderDetail.Status,
                    ToyId = report.OrderDetail.ToyId,
                    ToyName = report.OrderDetail.Toy.Name,
                    ToyImgUrls = mediaList,
                    OrderCheckImageUrl = OrderCheckImageList,
                    OrderCheckStatus = OrderCheckSatusList
                },
                UserId = report.UserId,
                User = new UserResponse
                {
                    Id = report.UserId,
                    FullName = report.User.FullName,
                    Email = report.User.Email,
                    CreateDate = report.User.CreateDate,
                    Phone = report.User.Phone,
                    Dob = report.User.Dob ?? DateTime.MinValue,
                    Address = report.User.Address,
                    AvatarUrl = report.User.AvatarUrl,
                    Description = report.User.Description,
                    Star = report.User.Star ?? 0,
                    Status = report.User.Status,
                    Role = new RoleResponse
                    {
                        Id = report.User.Role.Id,
                        Name = report.User.Role.Name
                    },
                    WalletId = report.User.WalletId,
                }
            };

            return CreatedAtAction("GetReport", new { id = report.Id }, reportResponse);
        }

        // DELETE: api/Reports/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var report = _unitOfWork.ReportRepository.GetByID(id);

            if (report == null)
            {
                return NotFound();
            }

            _unitOfWork.ReportRepository.Delete(report);
            _unitOfWork.Save();

            return NoContent();
        }

        // GET: api/Reports/Status/{status}
        [HttpGet("Status/{status}")]
        [EnableQuery]
        public ActionResult<IEnumerable<ReportResponse>> GetReportsByStatus(string status, int pageIndex = 1, int pageSize = 20)
        {
            var reports = _unitOfWork.ReportRepository.Get(
                includeProperties: "User,OrderDetail.Toy,User.Role",
                filter: r => r.Status == status,
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(r => r.Id);
            var reportResponse = reports.Select(report => {
                var mediaList = _unitOfWork.MediaRepository
                    .GetV2(m => m.ToyId == report.OrderDetail.ToyId)
                    .Select(m => m.MediaUrl)
                    .ToList();
                var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == report.OrderDetailId)
                    .Select(m => m.MediaUrl)
                    .ToList();
                var OrderCheckSatusList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == report.OrderDetail.OrderId)
                    .Select(m => m.Status)
                    .ToList();
                return new ReportResponse
                {
                    Id = report.Id,
                    VideoUrl = report.VideoUrl,
                    Description = report.Description,
                    Status = report.Status,
                    OrderDetailId = report.OrderDetailId,
                    OrderDetail = new OrderDetailResponse
                    {
                        Id = report.OrderDetail.Id,
                        OrderId = report.OrderDetail.OrderId,
                        RentPrice = (int)report.OrderDetail.RentPrice,
                        UnitPrice = report.OrderDetail.UnitPrice,
                        Quantity = report.OrderDetail.Quantity,
                        Deposit = (int)report.OrderDetail.Deposit,
                        StartDate = report.OrderDetail.StartDate,
                        EndDate = report.OrderDetail.EndDate,
                        Fine = report.OrderDetail.Fine,
                        RentCount = report.OrderDetail.RentCount,
                        OrderTypeId = report.OrderDetail.OrderTypeId,
                        RatingId = report.OrderDetail.RatingId,
                        Status = report.OrderDetail.Status,
                        ToyId = report.OrderDetail.ToyId,
                        ToyName = report.OrderDetail.Toy.Name,
                        ToyImgUrls = mediaList,
                        OrderCheckImageUrl = OrderCheckImageList,
                        OrderCheckStatus = OrderCheckSatusList
                    },
                    UserId = report.UserId,
                    User = new UserResponse
                    {
                        Id = report.UserId,
                        FullName = report.User.FullName,
                        Email = report.User.Email,
                        CreateDate = report.User.CreateDate,
                        Phone = report.User.Phone,
                        Dob = report.User.Dob ?? DateTime.MinValue,
                        Address = report.User.Address,
                        AvatarUrl = report.User.AvatarUrl,
                        Description = report.User.Description,
                        Star = report.User.Star ?? 0,
                        Status = report.User.Status,
                        Role = new RoleResponse
                        {
                            Id = report.User.Role.Id,
                            Name = report.User.Role.Name
                        },
                        WalletId = report.User.WalletId,
                    }
                };
            }).ToList();
            if (!reports.Any())
            {
                return NotFound(new { Message = "No reports found with the specified status." });
            }
            return Ok(reports);
        }
        // filter: r => r.OrderDetailId == orderDetailId
        // GET: api/Reports/OrderDetail/{orderDetailId}
        [HttpGet("OrderDetail/{orderDetailId}")]
        [EnableQuery]
        public ActionResult<IEnumerable<ReportResponse>> GetReportsByOrderDetailId(int orderDetailId, int pageIndex = 1, int pageSize = 20)
        {
            var reports = _unitOfWork.ReportRepository.Get(
                includeProperties: "User,OrderDetail.Toy,User.Role",
                filter: r => r.OrderDetailId == orderDetailId,
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(r => r.Id);
            var reportResponse = reports.Select(report => {
                var mediaList = _unitOfWork.MediaRepository
                    .GetV2(m => m.ToyId == report.OrderDetail.ToyId)
                    .Select(m => m.MediaUrl)
                    .ToList();
                var OrderCheckImageList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == report.OrderDetailId)
                    .Select(m => m.MediaUrl)
                    .ToList();
                var OrderCheckSatusList = _unitOfWork.OrderCheckImageRepository
                    .GetV2(m => m.OrderDetailId == report.OrderDetail.OrderId)
                    .Select(m => m.Status)
                    .ToList();
                return new ReportResponse
                {
                    Id = report.Id,
                    VideoUrl = report.VideoUrl,
                    Description = report.Description,
                    Status = report.Status,
                    OrderDetailId = report.OrderDetailId,
                    OrderDetail = new OrderDetailResponse
                    {
                        Id = report.OrderDetail.Id,
                        OrderId = report.OrderDetail.OrderId,
                        RentPrice = (int)report.OrderDetail.RentPrice,
                        UnitPrice = report.OrderDetail.UnitPrice,
                        Quantity = report.OrderDetail.Quantity,
                        Deposit = (int)report.OrderDetail.Deposit,
                        StartDate = report.OrderDetail.StartDate,
                        EndDate = report.OrderDetail.EndDate,
                        Fine = report.OrderDetail.Fine,
                        RentCount = report.OrderDetail.RentCount,
                        OrderTypeId = report.OrderDetail.OrderTypeId,
                        RatingId = report.OrderDetail.RatingId,
                        Status = report.OrderDetail.Status,
                        ToyId = report.OrderDetail.ToyId,
                        ToyName = report.OrderDetail.Toy.Name,
                        ToyImgUrls = mediaList,
                        OrderCheckImageUrl = OrderCheckImageList,
                        OrderCheckStatus = OrderCheckSatusList
                    },
                    UserId = report.UserId,
                    User = new UserResponse
                    {
                        Id = report.UserId,
                        FullName = report.User.FullName,
                        Email = report.User.Email,
                        CreateDate = report.User.CreateDate,
                        Phone = report.User.Phone,
                        Dob = report.User.Dob ?? DateTime.MinValue,
                        Address = report.User.Address,
                        AvatarUrl = report.User.AvatarUrl,
                        Description = report.User.Description,
                        Star = report.User.Star ?? 0,
                        Status = report.User.Status,
                        Role = new RoleResponse
                        {
                            Id = report.User.Role.Id,
                            Name = report.User.Role.Name
                        },
                        WalletId = report.User.WalletId,
                    }
                };
            }).ToList();

            if (!reports.Any())
            {
                return NotFound(new { Message = "No reports found for the specified OrderDetailId." });
            }

            return Ok(reports);
        }

        private bool ReportExists(int id)
        {
            return _unitOfWork.ReportRepository.Get().Any(r => r.Id == id);
        }
    }
}
