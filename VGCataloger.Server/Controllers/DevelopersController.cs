using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("developers")]
    public class DevelopersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DevelopersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Developer>>> Get()
        {
            return await _context.Developers.OrderBy(p => p.Name).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Developer>> Post([FromBody] Developer developer)
        {
            if (string.IsNullOrWhiteSpace(developer.Name))
                return BadRequest("Name is required.");

            _context.Developers.Add(developer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = developer.Id }, developer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Developer developer)
        {
            var existing = await _context.Developers.FindAsync(id);
            if (existing == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(developer.Name))
                return BadRequest("Name is required.");

            existing.Name = developer.Name;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var developer = await _context.Developers.FindAsync(id);
            if (developer == null)
                return NotFound();

            _context.Developers.Remove(developer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
