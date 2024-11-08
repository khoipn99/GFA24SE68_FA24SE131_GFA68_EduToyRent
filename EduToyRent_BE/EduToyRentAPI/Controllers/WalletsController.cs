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
using System.Security.Claims;

namespace EduToyRentAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class WalletsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public WalletsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Wallets
        [HttpGet]
        public ActionResult<IEnumerable<WalletResponse>> GetWallets(int pageIndex = 1, int pageSize = 50)
        {
            var wallets = _unitOfWork.WalletRepository.Get(
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(wallet => new WalletResponse
                {
                    Id = wallet.Id,
                    Balance = wallet.Balance,
                    WithdrawMethod = wallet.WithdrawMethod,
                    WithdrawInfo = wallet.WithdrawInfo,
                    Status = wallet.Status,
                    UserId = wallet.UserId
                }).ToList();

            return Ok(wallets);
        }

        // GET: api/Wallets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WalletResponse>> GetWallet(int id)
        {
            var wallet = _unitOfWork.WalletRepository.GetByID(id);

            if (wallet == null)
            {
                return NotFound();
            }

            var walletResponse = new WalletResponse
            {
                Id = wallet.Id,
                Balance = wallet.Balance,
                WithdrawMethod = wallet.WithdrawMethod,
                WithdrawInfo = wallet.WithdrawInfo,
                Status = wallet.Status,
                UserId = wallet.UserId
            };

            return Ok(walletResponse);
        }

        // PUT: api/Wallets/5
        [HttpPut("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> PutWallet(int id, WalletRequest walletRequest)
        {
            var wallet = _unitOfWork.WalletRepository.GetByID(id);

            if (wallet == null)
            {
                return NotFound();
            }

            wallet.Balance = walletRequest.Balance;
            wallet.WithdrawMethod = walletRequest.WithdrawMethod;
            wallet.WithdrawInfo = walletRequest.WithdrawInfo;
            wallet.Status = walletRequest.Status;
            wallet.UserId = walletRequest.UserId;

            _unitOfWork.WalletRepository.Update(wallet);

            try
            {
                _unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WalletExists(id))
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

        // POST: api/Wallets
        [HttpPost]
        public async Task<ActionResult<WalletResponse>> PostWallet(WalletRequest walletRequest)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token.");
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                return BadRequest("Invalid user ID format.");
            }

            var wallet = new Wallet
            {
                Balance = walletRequest.Balance,
                WithdrawMethod = walletRequest.WithdrawMethod,
                WithdrawInfo = walletRequest.WithdrawInfo,
                Status = walletRequest.Status,
                UserId = userId
            };

            _unitOfWork.WalletRepository.Insert(wallet);
            _unitOfWork.Save();

            var walletResponse = new WalletResponse
            {
                Id = wallet.Id,
                Balance = wallet.Balance,
                WithdrawMethod = wallet.WithdrawMethod,
                WithdrawInfo = wallet.WithdrawInfo,
                Status = wallet.Status
            };
            return CreatedAtAction(nameof(GetWallet), new { id = wallet.Id }, walletResponse);
        }


        // DELETE: api/Wallets/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> DeleteWallet(int id)
        {
            var wallet = _unitOfWork.WalletRepository.GetByID(id);
            if (wallet == null)
            {
                return NotFound();
            }

            _unitOfWork.WalletRepository.Delete(wallet);
            _unitOfWork.Save();

            return NoContent();
        }

        private bool WalletExists(int id)
        {
            return _unitOfWork.WalletRepository.Get().Any(e => e.Id == id);
        }
    }
}
