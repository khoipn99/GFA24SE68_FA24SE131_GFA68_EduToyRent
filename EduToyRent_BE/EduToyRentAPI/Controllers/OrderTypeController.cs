using EduToyRentRepositories.Interface;
using EduToyRentRepositories.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OrderTypeController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrderTypeController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/OrderType
        [HttpGet]
        public ActionResult<IEnumerable<OrderType>> GetOrderTypes(int pageIndex = 1, int pageSize = 50)
        {
            var orderTypes = _unitOfWork.OrderTypeRepository.Get(
                pageIndex: pageIndex,
                pageSize: pageSize).ToList();

            return Ok(orderTypes);
        }

        // GET: api/OrderType/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderType>> GetOrderType(int id)
        {
            var orderType = _unitOfWork.OrderTypeRepository.GetByID(id);

            if (orderType == null)
            {
                return NotFound();
            }

            return Ok(orderType);
        }

        // POST: api/OrderType
        [HttpPost]
        public async Task<ActionResult<OrderType>> PostOrderType(OrderType orderType)
        {
            if (orderType == null)
            {
                return BadRequest(new { Message = "Invalid order type data." });
            }

            _unitOfWork.OrderTypeRepository.Insert(orderType);
            _unitOfWork.Save();

            return CreatedAtAction("GetOrderType", new { id = orderType.Id }, orderType);
        }

        // PUT: api/OrderType/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderType(int id, OrderType orderType)
        {
            if (id != orderType.Id)
            {
                return BadRequest(new { Message = "ID mismatch." });
            }

            var existingOrderType = _unitOfWork.OrderTypeRepository.GetByID(id);

            if (existingOrderType == null)
            {
                return NotFound();
            }

            existingOrderType.Time = orderType.Time;
            existingOrderType.PercentPrice = orderType.PercentPrice;

            _unitOfWork.OrderTypeRepository.Update(existingOrderType);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderTypeExists(id))
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

        // DELETE: api/OrderType/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderType(int id)
        {
            var orderType = _unitOfWork.OrderTypeRepository.GetByID(id);

            if (orderType == null)
            {
                return NotFound();
            }

            _unitOfWork.OrderTypeRepository.Delete(orderType);
            _unitOfWork.Save();

            return NoContent();
        }

        private bool OrderTypeExists(int id)
        {
            return _unitOfWork.OrderTypeRepository.Get().Any(e => e.Id == id);
        }
    }
}
