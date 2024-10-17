using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduToyRentRepositories.Models;

namespace EduToyRentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToySuppliersController : ControllerBase
    {
        private readonly EduToyRentDBContext _context;

        public ToySuppliersController(EduToyRentDBContext context)
        {
            _context = context;
        }

        // GET: api/ToySuppliers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ToySupplier>>> GetToySuppliers()
        {
            return await _context.ToySuppliers.ToListAsync();
        }

        // GET: api/ToySuppliers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ToySupplier>> GetToySupplier(int id)
        {
            var toySupplier = await _context.ToySuppliers.FindAsync(id);

            if (toySupplier == null)
            {
                return NotFound();
            }

            return toySupplier;
        }

        // PUT: api/ToySuppliers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutToySupplier(int id, ToySupplier toySupplier)
        {
            if (id != toySupplier.Id)
            {
                return BadRequest();
            }

            _context.Entry(toySupplier).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ToySupplierExists(id))
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

        // POST: api/ToySuppliers
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ToySupplier>> PostToySupplier(ToySupplier toySupplier)
        {
            _context.ToySuppliers.Add(toySupplier);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetToySupplier", new { id = toySupplier.Id }, toySupplier);
        }

        // DELETE: api/ToySuppliers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteToySupplier(int id)
        {
            var toySupplier = await _context.ToySuppliers.FindAsync(id);
            if (toySupplier == null)
            {
                return NotFound();
            }

            _context.ToySuppliers.Remove(toySupplier);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ToySupplierExists(int id)
        {
            return _context.ToySuppliers.Any(e => e.Id == id);
        }
    }
}
