using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Models;
using EduToyRentRepositories.DTO.Request;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.Interface;
using Microsoft.AspNetCore.Authorization;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CartsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Carts
        [HttpGet]
        //[Authorize(Roles = "1")]
        public ActionResult<IEnumerable<CartResponse>> GetCarts(int pageIndex = 1, int pageSize = 50)
        {
            var carts = _unitOfWork.CartRepository.Get(pageIndex: pageIndex, pageSize: pageSize)
                .Select(cart => new CartResponse
                {
                    Id = cart.Id,
                    TotalPrice = cart.TotalPrice,
                    Status = cart.Status,
                    UserId = cart.UserId
                }).ToList();

            return Ok(carts);
        }

        // GET: api/Carts/5
        [HttpGet("{id}")]
        //[Authorize(Roles = "1,3")]
        public async Task<ActionResult<CartResponse>> GetCart(int id)
        {
            var cart = _unitOfWork.CartRepository.GetByID(id);

            if (cart == null)
            {
                return NotFound();
            }

            var cartResponse = new CartResponse
            {
                Id = cart.Id,
                TotalPrice = cart.TotalPrice,
                Status = cart.Status,
                UserId = cart.UserId
            };

            return Ok(cartResponse);
        }

        // PUT: api/Carts/5
        [HttpPut("{id}")]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> PutCart(int id, CartRequest cartRequest)
        {
            var cart = _unitOfWork.CartRepository.GetByID(id);

            if (cart == null)
            {
                return NotFound();
            }

            cart.TotalPrice = cartRequest.TotalPrice;
            cart.Status = cartRequest.Status;
            cart.UserId = cartRequest.UserId;

            _unitOfWork.CartRepository.Update(cart);
            _unitOfWork.Save();

            return NoContent();
        }

        // POST: api/Carts
        [HttpPost]
        //[Authorize(Roles = "1")]
        public async Task<ActionResult<CartResponse>> PostCart(CartRequest cartRequest)
        {
            var cart = new Cart
            {
                TotalPrice = 0,
                Status = cartRequest.Status,
                UserId = cartRequest.UserId
            };

            _unitOfWork.CartRepository.Insert(cart);
            _unitOfWork.Save();

            var cartResponse = new CartResponse
            {
                Id = cart.Id,
                TotalPrice = 0,
                Status = cart.Status,
                UserId = cart.UserId
            };

            return CreatedAtAction("GetCart", new { id = cart.Id }, cartResponse);
        }

        // DELETE: api/Carts/5
        [HttpDelete("{id}")]
        //[Authorize(Roles = "1")]
        public async Task<IActionResult> DeleteCart(int id)
        {
            var cart = _unitOfWork.CartRepository.GetByID(id);
            if (cart == null)
            {
                return NotFound();
            }

            _unitOfWork.CartRepository.Delete(cart);
            _unitOfWork.Save();

            return NoContent();
        }
    }
}
