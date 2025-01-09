using EduToyRentRepositories.DTO.Request;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PlatformFeesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PlatformFeesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/PlatformFees
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<PlatformFeeResponse>> GetPlatformFees(int pageIndex = 1, int pageSize = 20)
        {
            var platformFees = _unitOfWork.PlatformFeeRepository.Get(
                pageIndex: pageIndex,
                pageSize: pageSize)
                .OrderByDescending(pf => pf.Id)
                .Select(platformFee => new PlatformFeeResponse
                {
                    Id = platformFee.Id,
                    Percent = platformFee.Percent
                }).ToList();

            return Ok(platformFees);
        }

        // GET: api/PlatformFees/5
        [HttpGet("{id}")]
        [EnableQuery]
        public ActionResult<PlatformFeeResponse> GetPlatformFee(int id)
        {
            var platformFee = _unitOfWork.PlatformFeeRepository.GetByID(id);

            if (platformFee == null)
            {
                return NotFound();
            }

            var platformFeeResponse = new PlatformFeeResponse
            {
                Id = platformFee.Id,
                Percent = platformFee.Percent
            };

            return Ok(platformFeeResponse);
        }

        // PUT: api/PlatformFees/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPlatformFee(int id, PlatformFeeRequest platformFeeRequest)
        {
            var platformFee = _unitOfWork.PlatformFeeRepository.GetByID(id);

            if (platformFee == null)
            {
                return NotFound();
            }

            platformFee.Percent = platformFeeRequest.Percent;

            _unitOfWork.PlatformFeeRepository.Update(platformFee);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PlatformFeeExists(id))
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

        // POST: api/PlatformFees
        [HttpPost]
        public async Task<ActionResult<PlatformFeeResponse>> PostPlatformFee(PlatformFeeRequest platformFeeRequest)
        {
            var platformFee = new PlatformFee
            {
                Percent = platformFeeRequest.Percent
            };

            _unitOfWork.PlatformFeeRepository.Insert(platformFee);
            _unitOfWork.Save();

            var platformFeeResponse = new PlatformFeeResponse
            {
                Id = platformFee.Id,
                Percent = platformFee.Percent
            };

            return CreatedAtAction("GetPlatformFee", new { id = platformFee.Id }, platformFeeResponse);
        }

        // DELETE: api/PlatformFees/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlatformFee(int id)
        {
            var platformFee = _unitOfWork.PlatformFeeRepository.GetByID(id);

            if (platformFee == null)
            {
                return NotFound();
            }

            _unitOfWork.PlatformFeeRepository.Delete(platformFee);
            _unitOfWork.Save();

            return NoContent();
        }

        private bool PlatformFeeExists(int id)
        {
            return _unitOfWork.PlatformFeeRepository.Get().Any(pf => pf.Id == id);
        }
    }
}
