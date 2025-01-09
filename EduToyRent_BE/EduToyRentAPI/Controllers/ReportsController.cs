using EduToyRentAPI.FireBaseService;
using EduToyRentRepositories.DTO.Request;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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
                includeProperties: "OrderDetail.Order,User,OrderDetail.Toy",
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(r => r.Id)
                .Select(report => new ReportResponse
                {
                    Id = report.Id,
                    VideoUrl = report.VideoUrl,
                    Description = report.Description,
                    Status = report.Status,
                    OrderDetailId = report.OrderDetailId,
                    ToyId = report.OrderDetail.Toy.Id,
                    ToyName = report.OrderDetail.Toy.Name,
                    UserId = report.UserId,
                    UserName = report.User.FullName
                }).ToList();

            return Ok(reports);
        }

        // GET: api/Reports/5
        [HttpGet("{id}")]
        [EnableQuery]
        public ActionResult<ReportResponse> GetReport(int id)
        {
            var report = _unitOfWork.ReportRepository.Get(
                includeProperties: "OrderDetail.Order,User,OrderDetail.Toy",
                filter: r => r.Id == id)
                .FirstOrDefault();

            if (report == null)
            {
                return NotFound();
            }

            var reportResponse = new ReportResponse
            {
                Id = report.Id,
                VideoUrl = report.VideoUrl,
                Description = report.Description,
                Status = report.Status,
                OrderDetailId = report.OrderDetailId,
                ToyId = report.OrderDetail.Toy.Id,
                ToyName = report.OrderDetail.Toy.Name,
                UserId = report.UserId,
                UserName = report.User.FullName
            };

            return Ok(reportResponse);
        }

        // PUT: api/Reports/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReport([FromForm] ReportRequest reportRequest, int id)
        {
            var report = _unitOfWork.ReportRepository.GetByID(id);
            if (report == null)
            {
                return NotFound(new { Message = "Report not found" });
            }

            if (reportRequest.VideoUrl == null || reportRequest.VideoUrl.Length == 0)
            {
                return BadRequest(new { Message = "No video file was uploaded" });
            }

            if (!string.IsNullOrEmpty(report.VideoUrl))
            {
                try
                {
                    await _fireBaseService.DeleteImageAsync(report.VideoUrl);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new { Message = $"Failed to delete old video: {ex.Message}" });
                }
            }

            string newVideoUrl;
            try
            {
                newVideoUrl = await _fireBaseService.UploadImageAsync(reportRequest.VideoUrl);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = $"Failed to upload new video: {ex.Message}" });
            }

            report.VideoUrl = newVideoUrl;
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
        public async Task<ActionResult<ReportResponse>> PostReport([FromForm] ReportRequest reportRequest)
        {
            var orderDetail = _unitOfWork.OrderDetailRepository.GetByID(reportRequest.OrderDetailId);
            if (orderDetail == null)
            {
                return NotFound(new { Message = "Order detail not found" });
            }

            if (reportRequest.VideoUrl == null || reportRequest.VideoUrl.Length == 0)
            {
                return BadRequest(new { Message = "No video file was uploaded" });
            }

            string uploadedVideoUrl;
            try
            {
                uploadedVideoUrl = await _fireBaseService.UploadImageAsync(reportRequest.VideoUrl);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = $"Failed to upload video: {ex.Message}" });
            }

            var report = new Report
            {
                VideoUrl = uploadedVideoUrl,
                Description = reportRequest.Description,
                Status = reportRequest.Status,
                OrderDetailId = reportRequest.OrderDetailId,
                UserId = reportRequest.UserId
            };

            _unitOfWork.ReportRepository.Insert(report);
            _unitOfWork.Save();

            var createdReport = _unitOfWork.ReportRepository.Get(
                includeProperties: "OrderDetail.Toy,User",
                filter: r => r.Id == report.Id).FirstOrDefault();

            if (createdReport == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "Failed to retrieve the created report" });
            }

            var reportResponse = new ReportResponse
            {
                Id = createdReport.Id,
                VideoUrl = createdReport.VideoUrl,
                Description = createdReport.Description,
                Status = createdReport.Status,
                OrderDetailId = createdReport.OrderDetailId,
                ToyId = createdReport.OrderDetail.Toy.Id,
                ToyName = createdReport.OrderDetail.Toy.Name,
                UserId = createdReport.UserId,
                UserName = createdReport.User.FullName
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
                includeProperties: "OrderDetail.Order,User,OrderDetail.Toy",
                filter: r => r.Status == status,
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(r => r.Id)
                .Select(report => new ReportResponse
                {
                    Id = report.Id,
                    VideoUrl = report.VideoUrl,
                    Description = report.Description,
                    Status = report.Status,
                    OrderDetailId = report.OrderDetailId,
                    ToyId = report.OrderDetail.Toy.Id,
                    ToyName = report.OrderDetail.Toy.Name,
                    UserId = report.UserId,
                    UserName = report.User.FullName
                }).ToList();

            if (!reports.Any())
            {
                return NotFound(new { Message = "No reports found with the specified status." });
            }

            return Ok(reports);
        }

        // GET: api/Reports/OrderDetail/{orderDetailId}
        [HttpGet("OrderDetail/{orderDetailId}")]
        [EnableQuery]
        public ActionResult<IEnumerable<ReportResponse>> GetReportsByOrderDetailId(int orderDetailId, int pageIndex = 1, int pageSize = 20)
        {
            var reports = _unitOfWork.ReportRepository.Get(
                includeProperties: "OrderDetail.Order,User,OrderDetail.Toy",
                filter: r => r.OrderDetailId == orderDetailId,
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(r => r.Id)
                .Select(report => new ReportResponse
                {
                    Id = report.Id,
                    VideoUrl = report.VideoUrl,
                    Description = report.Description,
                    Status = report.Status,
                    OrderDetailId = report.OrderDetailId,
                    ToyId = report.OrderDetail.Toy.Id,
                    ToyName = report.OrderDetail.Toy.Name,
                    UserId = report.UserId,
                    UserName = report.User.FullName
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
