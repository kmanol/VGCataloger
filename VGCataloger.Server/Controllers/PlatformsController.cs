using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("platforms")]
    public class PlatformsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlatformsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Platform>>> Get()
        {
            return await _context.Platforms.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Platform>> Post([FromBody] Platform platform)
        {
            if (string.IsNullOrWhiteSpace(platform.Name))
                return BadRequest("Name is required.");

            _context.Platforms.Add(platform);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = platform.Id }, platform);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Platform platform)
        {
            var existing = await _context.Platforms.FindAsync(id);
            if (existing == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(platform.Name))
                return BadRequest("Name is required.");

            existing.Name = platform.Name;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var platform = await _context.Platforms.FindAsync(id);
            if (platform == null)
                return NotFound();

            _context.Platforms.Remove(platform);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
