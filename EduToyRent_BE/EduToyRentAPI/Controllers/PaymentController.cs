using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Net.payOS.Types;
using Net.payOS;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private string clientId = "3445f1b2-fdb5-4a32-bba7-4cdb780685ee";
        private string apiKey = "bf23bcf1-423e-4d31-9540-e487647278cf";
        private string checksumKey = "aa60025cc4de8437f2ceffc8cce9ba108c6422f5812911586cb7b381828ebfd5";

        [HttpPost("create-payment-link")]
        public async Task<IActionResult> CreatePaymentLink(int totalAmount, int orderId) 
        {   
            try
            {
                var payOS = new PayOS(clientId, apiKey, checksumKey);

                var domain = "http://localhost:3000";

                //string paymentCode = DateTime.Now.ToString("yyyy_MM_dd_HH_mm_ss");

                var paymentLinkRequest = new PaymentData(
                    orderCode: int.Parse(DateTimeOffset.Now.ToString("ffffff")),
                    amount: totalAmount,
                    description: "EduToyRent ",
                    items: [new("" + orderId, 1, totalAmount)],
                    //returnUrl: domain + "?success=true",
                    //cancelUrl: domain + "?canceled=true"
                    returnUrl: domain,
                    cancelUrl: domain + "/login"
                );
                var response = await payOS.createPaymentLink(paymentLinkRequest);

                Response.Headers.Append("Location", response.checkoutUrl);
                //return new StatusCodeResult(303);
                return Ok(new
                {
                    message = "Redirect to PayOS",
                    url = response.checkoutUrl
                });
            }
            catch (System.Exception exception)
            {
                Console.WriteLine(exception);
                return Redirect("http://localhost:3000");
            }

        }



            //[HttpPost]
            //public async Task<IActionResult> Checkout([FromQuery] int userId, [FromQuery] int orderId, [FromQuery] int paymentId)
            //{
            //    try
            //    {
            //        int orderCode = int.Parse(DateTimeOffset.Now.ToString("ffffff"));
            //        var total = 0.0;
            //        List<ItemData> items = new List<ItemData>();
            //        var order = await _service.GetOrderDetailAsync(orderId);
            //        var orders = await _service.GetOrderById(orderId);
            //        foreach (var o in order)
            //        {
            //            ItemData item = new ItemData(o.Cart.Product != null ? o.Cart.Product.Name : o.Cart.Diamond.Name, (int)o.Cart.Quantity, (int)(o.Cart.TotalPrice * USD));
            //            items.Add(item);
            //        }
            //        var baseUrl = "https://diamond-shopp.azurewebsites.net/api/" + "PayOs/Success";

            //        var url = $"{baseUrl}?userId={userId}&orderId={orderId}&paymentId={paymentId}";
            //        PaymentData paymentData = new PaymentData(orderCode, (int)(orders.TotalPrice * USD), "Pay Order", items,
            //            url, url);
            //        CreatePaymentResult createPayment = await _payOs.createPaymentLink(paymentData);

            //        return Ok(new
            //        {
            //            message = "redirect",
            //            url = createPayment.checkoutUrl
            //        });
            //    }
            //    catch (System.Exception exception)
            //    {
            //        Console.WriteLine(exception);
            //        return Redirect("https://deploy-prn221.vercel.app/order");
            //    }
            //}

            //[HttpGet]
            //public async Task<IActionResult> Success([FromQuery] int userId, [FromQuery] int orderId, [FromQuery] int paymentId, [FromQuery] string status)
            //{
            //    if (status == "CANCELLED")
            //    {
            //        var cancel = await _service.CreateOrderStatusAsync(orderId, "Cancelled", userId, paymentId);
            //        return Redirect("https://deploy-prn221.vercel.app/order");
            //    }
            //    var success = await _service.CreateOrderStatusAsync(orderId, "Paid", userId, paymentId);
            //    if (success)
            //    {
            //        return Redirect("https://deploy-prn221.vercel.app/payment/success");
            //    }
            //    return Redirect("https://deploy-prn221.vercel.app/order");
            //}

        }
}
