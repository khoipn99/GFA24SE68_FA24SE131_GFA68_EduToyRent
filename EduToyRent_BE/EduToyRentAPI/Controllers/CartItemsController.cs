﻿using System;
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
using Humanizer;
using Microsoft.AspNetCore.OData.Query;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CartItemsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CartItemsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/CartItems
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<CartItemResponse>> GetCartItems(int pageIndex = 1, int pageSize = 50)
        {
            var cartItems = _unitOfWork.CartItemRepository.Get(pageIndex: pageIndex, pageSize: pageSize).ToList();
            var cartItemResponses = cartItems.Select(ci =>
            {
                var mediaList = _unitOfWork.MediaRepository
                    .GetV2(m => m.ToyId == ci.ToyId)
                    .Select(m => m.MediaUrl)
                    .ToList();
                return new CartItemResponse
                {
                    Id = ci.Id,
                    Price = ci.Price,
                    Quantity = ci.Quantity,
                    OrderTypeId = (int)ci.OrderTypeId,
                    Status = ci.Status,
                    CartId = (int)ci.CartId,
                    ToyId = (int)ci.ToyId,
                    ToyName = _unitOfWork.ToyRepository.GetByID(ci.ToyId).Name,
                    ToyPrice = _unitOfWork.ToyRepository.GetByID(ci.ToyId).Price,
                    ShopId = _unitOfWork.ToyRepository.GetByID(ci.ToyId).UserId,
                    ToyImgUrls = mediaList
                };
            }).ToList();
            if (!cartItemResponses.Any())
            {
                return Ok("Empty List!");
            }
            return Ok(cartItemResponses);
        }

        // GET: api/CartItems/5
        [HttpGet("{id}")]
        [EnableQuery]
        public async Task<ActionResult<CartItemResponse>> GetCartItem(int id)
        {
            var cartItem = _unitOfWork.CartItemRepository.GetByID(id);

            if (cartItem == null)
            {
                return NotFound();
            }

            var mediaList = _unitOfWork.MediaRepository
                            .GetV2(m => m.ToyId == cartItem.ToyId)
                            .Select(m => m.MediaUrl)
                            .ToList();
            var cartItemResponse = new CartItemResponse
            {
                Id = cartItem.Id,
                Price = cartItem.Price,
                Quantity = cartItem.Quantity,
                Status = cartItem.Status,
                CartId = (int)cartItem.CartId,
                ToyId = (int)cartItem.ToyId,
                OrderTypeId = (int)cartItem.OrderTypeId,
                ToyName = _unitOfWork.ToyRepository.GetByID(cartItem.ToyId).Name,
                ToyPrice = _unitOfWork.ToyRepository.GetByID(cartItem.ToyId).Price,
                ShopId = _unitOfWork.ToyRepository.GetByID(cartItem.ToyId).UserId,
                ToyImgUrls = mediaList
            };

            return Ok(cartItemResponse);
        }

        // PUT: api/CartItems/5
        [HttpPut("{id}")]
        [EnableQuery]
        public async Task<IActionResult> PutCartItem(int id, CartItemRequest cartItemRequest)
        {
            var cartItem = _unitOfWork.CartItemRepository.GetByID(id);

            if (cartItem == null)
            {
                return NotFound();
            }
            var toy = _unitOfWork.ToyRepository.GetByID(cartItemRequest.ToyId);
            if (toy == null)
            {
                return NotFound(new { Message = "Toy not found" });
            }
            if (toy.BuyQuantity > 0)
            {
                if (cartItemRequest.Quantity > toy.BuyQuantity)
                {
                    return BadRequest(new { Message = "Understocking: Quantity exceeds available stock." });
                }
                else if (cartItemRequest.Quantity < toy.BuyQuantity)
                {
                    var cart = _unitOfWork.CartRepository.GetByID(cartItemRequest.CartId);
                    if (cart == null)
                    {
                        return NotFound(new { Message = "Cart not found" });
                    }
                    cart.TotalPrice -= cartItem.Price * cartItem.Quantity;
                    cart.TotalPrice += cartItem.Price * cartItemRequest.Quantity;
                    _unitOfWork.CartRepository.Update(cart);
                }
            }

            cartItem.Price = cartItemRequest.Price;
            cartItem.Quantity = cartItemRequest.Quantity;
            cartItem.OrderTypeId = cartItemRequest.OrderTypeId;
            cartItem.Status = cartItemRequest.Status;
            cartItem.CartId = cartItemRequest.CartId;
            cartItem.ToyId = cartItemRequest.ToyId;

            _unitOfWork.CartItemRepository.Update(cartItem);
            _unitOfWork.Save();

            return NoContent();
        }

        // POST: api/CartItems
        [HttpPost]
        [EnableQuery]
        public async Task<ActionResult<CartItemResponse>> PostCartItem(CartItemRequest cartItemRequest)
        {
            var toy = _unitOfWork.ToyRepository.GetByID(cartItemRequest.ToyId);
            if (toy == null)
            {
                return NotFound(new { Message = "Toy not found" });
            }

            var cartItem = new CartItem
            {
                Price = cartItemRequest.Price,
                Quantity = cartItemRequest.Quantity,
                OrderTypeId = cartItemRequest.OrderTypeId,
                Status = cartItemRequest.Status,
                CartId = cartItemRequest.CartId,
                ToyId = cartItemRequest.ToyId
            };

            if (toy.BuyQuantity > 0)
            {
                if (cartItem.Quantity > toy.BuyQuantity)
                {
                    return BadRequest(new { Message = "Understocking: Quantity exceeds available stock." });
                }
                else if (cartItem.Quantity < toy.BuyQuantity)
                {
                    var cart = _unitOfWork.CartRepository.GetByID(cartItemRequest.CartId);
                    if (cart == null)
                    {
                        return NotFound(new { Message = "Cart not found" });
                    }

                    cart.TotalPrice += cartItem.Price * cartItem.Quantity;
                    _unitOfWork.CartRepository.Update(cart);
                }
            }
            else if (toy.BuyQuantity == 0)
            {
                return BadRequest(new { Message = "Out of stock." });
            }
            else 
            {
                //cartItem.Quantity = 1;
                var cart =  _unitOfWork.CartRepository.GetByID(cartItemRequest.CartId);
                if (cart == null)
                {
                    return NotFound(new { Message = "Cart not found" });
                }

                cart.TotalPrice += cartItem.Price ;
                _unitOfWork.CartRepository.Update(cart);
            }

            _unitOfWork.CartItemRepository.Insert(cartItem);
            _unitOfWork.Save();

            var cartItemResponse = new CartItemResponse
            {
                Id = cartItem.Id,
                Price = cartItem.Price,
                Quantity = cartItem.Quantity,
                OrderTypeId = (int)cartItem.OrderTypeId,
                Status = cartItem.Status,
                CartId = (int)cartItem.CartId,
                ToyId = (int)cartItem.ToyId
            };

            return CreatedAtAction("GetCartItem", new { id = cartItem.Id }, cartItemResponse);
        }

        // DELETE: api/CartItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var cartItem = _unitOfWork.CartItemRepository.GetByID(id);
            if (cartItem == null)
            {
                return NotFound();
            }
            var toy = _unitOfWork.ToyRepository.GetByID(cartItem.ToyId);
            if (toy == null)
            {
                return NotFound(new { Message = "Toy not found" });
            }
            var cart = _unitOfWork.CartRepository.GetByID(cartItem.CartId);
            if (cart == null)
            {
                return NotFound(new { Message = "Cart not found" });
            }
            if(toy.BuyQuantity > 0)
            {
                cart.TotalPrice -= cartItem.Price * cartItem.Quantity;
                _unitOfWork.CartRepository.Update(cart);
            }
            else if (toy.BuyQuantity < 0)
            {
                cart.TotalPrice -= cartItem.Price;
                _unitOfWork.CartRepository.Update(cart);
            }
            _unitOfWork.CartItemRepository.Delete(cartItem);
            _unitOfWork.Save();

            return NoContent();
        }
        // lay cartItem theo cartId 
        [HttpGet("ByCartId/{cartId}")]
        [EnableQuery]
        public ActionResult<IEnumerable<CartItemResponse>> GetCartItemsByCartId(int cartId)
        {
            var cartItems = _unitOfWork.CartItemRepository.Get(
                filter: ci => ci.CartId == cartId,
                includeProperties: "Toy")
                .ToList(); 

            if (cartItems == null || !cartItems.Any())
            {
                return Ok("Empty List!");
            }

            var cartItemResponses = cartItems.Select(ci =>
            {
                var mediaList = _unitOfWork.MediaRepository
                    .GetV2(m => m.ToyId == ci.ToyId) 
                    .Select(m => m.MediaUrl) 
                    .ToList();
                return new CartItemResponse
                {
                    Id = ci.Id,
                    Price = ci.Price,
                    Quantity = ci.Quantity,
                    OrderTypeId = (int)ci.OrderTypeId,
                    Status = ci.Status,
                    CartId = (int)ci.CartId,
                    ToyId = (int)ci.ToyId,
                    ToyName = _unitOfWork.ToyRepository.GetByID(ci.ToyId).Name,
                    ToyPrice = _unitOfWork.ToyRepository.GetByID(ci.ToyId).Price,
                    ShopId = _unitOfWork.ToyRepository.GetByID(ci.ToyId).UserId,
                    ToyImgUrls = mediaList 
                };
            }).ToList();
            if (!cartItemResponses.Any())
            {
                return Ok("Empty List!");
            }
            return Ok(cartItemResponses); 
        }

    }
}
