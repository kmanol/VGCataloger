using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("statuses")]
    public class StatusesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatusesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Status>>> Get()
        {
            return await _context.Statuses.OrderBy(p => p.Name).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Status>> Post([FromBody] Status status)
        {
            if (string.IsNullOrWhiteSpace(status.Name))
                return BadRequest("Name is required.");

            _context.Statuses.Add(status);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = status.Id }, status);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Status status)
        {
            var existing = await _context.Statuses.FindAsync(id);
            if (existing == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(status.Name))
                return BadRequest("Name is required.");

            existing.Name = status.Name;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var status = await _context.Statuses.FindAsync(id);
            if (status == null)
                return NotFound();

            _context.Statuses.Remove(status);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
