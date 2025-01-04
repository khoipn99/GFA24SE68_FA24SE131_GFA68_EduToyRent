using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Models;
using EduToyRentRepositories.Interface;
using EduToyRentRepositories.DTO.Response;
using EduToyRentRepositories.DTO.Request;
using System.Diagnostics;
using Microsoft.AspNetCore.OData.Query;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionDetailsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public TransactionDetailsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/TransactionDetails
        [HttpGet]
        [EnableQuery]
        public ActionResult<IEnumerable<TransactionDetailResponse>> GetTransactionDetails(int pageIndex = 1, int pageSize = 50)
        {
            var transactionDetails = _unitOfWork.TransactionDetailRepository.Get(
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(transactionDetail => new TransactionDetailResponse
                {
                    Id = transactionDetail.Id,
                    ReceiveMoney = (float)transactionDetail.ReceiveMoney,
                    PlatformFee = (float)transactionDetail.PlatformFee,
                    OwnerReceiveMoney = (float)transactionDetail.OwnerReceiveMoney,
                    DepositBackMoney = (float)transactionDetail.DepositBackMoney,
                    OrderDetailId = transactionDetail.OrderDetailId,
                    TransactionId = transactionDetail.TranSactionId,
                    FineFee = (float)transactionDetail.FineFee,
                    Date = transactionDetail.Date ?? DateTime.MinValue,
                    Status = transactionDetail.Status,
                    PlatformFeeResponse = new PlatformFeeResponse()
                    {
                        Id = transactionDetail.PlatformFeeId,
                        Percent = _unitOfWork.PlatformFeeRepository.GetByID(transactionDetail.PlatformFeeId).Percent,
                    }
                }).ToList();

            if (!transactionDetails.Any())
            {
                return Ok("Empty List!");
            }

            return Ok(transactionDetails);
        }

        // GET: api/TransactionDetails/5
        [HttpGet("{id}")]
        [EnableQuery]
        public async Task<ActionResult<TransactionDetailResponse>> GetTransactionDetail(int id)
        {
            var transactionDetail = _unitOfWork.TransactionDetailRepository.GetByID(id);

            if (transactionDetail == null)
            {
                return NotFound();
            }
            var transactionDetailResponse = new TransactionDetailResponse
            {
                Id = transactionDetail.Id,
                ReceiveMoney = (float)transactionDetail.ReceiveMoney,
                PlatformFee = (float)transactionDetail.PlatformFee,
                OwnerReceiveMoney = (float)transactionDetail.OwnerReceiveMoney,
                DepositBackMoney = (float)transactionDetail.DepositBackMoney,
                OrderDetailId = transactionDetail.OrderDetailId,
                TransactionId = transactionDetail.TranSactionId,
                FineFee= (float)transactionDetail.FineFee,
                Date = transactionDetail.Date ?? DateTime.MinValue,
                Status = transactionDetail.Status,
                PlatformFeeResponse = new PlatformFeeResponse()
                {
                    Id = transactionDetail.PlatformFeeId,
                    Percent = _unitOfWork.PlatformFeeRepository.GetByID(transactionDetail.PlatformFeeId).Percent,
                }
            };

            return transactionDetailResponse;
        }

        // PUT: api/TransactionDetails/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransactionDetail(int id, TransactionDetailRequest transactionDetail)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            var tranDetail = _unitOfWork.TransactionDetailRepository.GetByID(id);
            if (tranDetail == null)
            {
                return NotFound(id);
            }
            tranDetail.ReceiveMoney = transactionDetail.ReceiveMoney;
            tranDetail.PlatformFee = transactionDetail.PlatformFee;
            tranDetail.OwnerReceiveMoney = transactionDetail.OwnerReceiveMoney;
            tranDetail.DepositBackMoney = transactionDetail.DepositBackMoney;
            tranDetail.OrderDetailId = transactionDetail.OrderDetailId;
            tranDetail.TranSactionId = transactionDetail.TransactionId;
            tranDetail.FineFee = transactionDetail.FineFee;
            tranDetail.Date = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            tranDetail.Status = transactionDetail.Status;
            tranDetail.PlatformFeeId = transactionDetail.PlatformFeeId;

            _unitOfWork.TransactionDetailRepository.Update(tranDetail);
            _unitOfWork.Save();

            return Ok("Update Successfully!!!");
        }

        // POST: api/TransactionDetails
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TransactionDetail>> PostTransactionDetail(TransactionDetailRequest transactionDetail)
        {
            var vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            var vietnamTime = TimeZoneInfo.ConvertTime(DateTime.Now, vietnamTimeZone);

            var transDetail = new TransactionDetail
            {
                ReceiveMoney = transactionDetail.ReceiveMoney,
                PlatformFee = transactionDetail.PlatformFee,
                OwnerReceiveMoney = transactionDetail.OwnerReceiveMoney,
                DepositBackMoney = transactionDetail.DepositBackMoney,
                TranSactionId = transactionDetail.TransactionId,
                OrderDetailId = transactionDetail.OrderDetailId,
                FineFee = transactionDetail.FineFee,
                Date = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")),
                Status = transactionDetail.Status,
                PlatformFeeId = transactionDetail.PlatformFeeId,
            };

            _unitOfWork.TransactionDetailRepository.Insert(transDetail);
            _unitOfWork.Save();

            var transactionDetailResponse = new TransactionDetailResponse
            {
                Id = transDetail.Id,
                ReceiveMoney = (float)transDetail.ReceiveMoney,
                PlatformFee = (float)transDetail.PlatformFee,
                DepositBackMoney = (float)transDetail.DepositBackMoney,
                OwnerReceiveMoney = (float)transDetail.OwnerReceiveMoney,
                TransactionId = transactionDetail.TransactionId,
                OrderDetailId = transactionDetail.OrderDetailId,
                FineFee= transactionDetail.FineFee,
                Date = transDetail.Date?? DateTime.MinValue,
                Status = transactionDetail.Status,
                PlatformFeeResponse = new PlatformFeeResponse()
                {
                    Id = transactionDetail.PlatformFeeId,
                    Percent = _unitOfWork.PlatformFeeRepository.GetByID(transDetail.PlatformFeeId).Percent,
                }
            };

            return CreatedAtAction("GetTransactionDetail", new { id = transDetail.Id }, transactionDetail);
        }

        // DELETE: api/TransactionDetails/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransactionDetail(int id)
        {
            var transactionDetail = _unitOfWork.TransactionDetailRepository.GetByID(id);

            if (transactionDetail == null)
            {
                return NotFound();
            }

            _unitOfWork.TransactionDetailRepository.Delete(id);
            _unitOfWork.Save();

            return NoContent();
        }
        //By TransactionId
        [HttpGet("transaction/{transactionId}")]
        [EnableQuery]
        public ActionResult<IEnumerable<TransactionDetailResponse>> GetTransactionDetailsByTransactionId(int transactionId,int pageIndex = 1, int pageSize = 50)
        {
            var transactionDetails = _unitOfWork.TransactionDetailRepository.Get(
                td => td.TranSactionId == transactionId,
                pageIndex: pageIndex,
                pageSize: pageSize)
                .Select(transactionDetail => new TransactionDetailResponse
                {
                    Id = transactionDetail.Id,
                    ReceiveMoney = (float)transactionDetail.ReceiveMoney,
                    PlatformFee = (float)transactionDetail.PlatformFee,
                    OwnerReceiveMoney = (float)transactionDetail.OwnerReceiveMoney,
                    DepositBackMoney = (float)transactionDetail.DepositBackMoney,
                    OrderDetailId = transactionDetail.OrderDetailId,
                    TransactionId = transactionDetail.TranSactionId,
                    FineFee = (float)transactionDetail.FineFee,
                    Date = transactionDetail.Date ?? DateTime.MinValue,
                    Status = transactionDetail.Status,
                    PlatformFeeResponse = new PlatformFeeResponse()
                    {
                        Id = transactionDetail.PlatformFeeId,
                        Percent = _unitOfWork.PlatformFeeRepository.GetByID(transactionDetail.PlatformFeeId).Percent,
                    }
                }).ToList();

            if (!transactionDetails.Any())
            {
                return Ok("Empty List!");
            }

            return Ok(transactionDetails);
        }
    }
}
