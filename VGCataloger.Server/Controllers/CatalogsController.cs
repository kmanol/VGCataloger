using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("catalogs")]
    public class CatalogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CatalogsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Catalog>>> Get()
        {
            return await _context.Catalogs.OrderBy(p => p.Name).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Catalog>> Post([FromBody] Catalog catalog)
        {
            if (string.IsNullOrWhiteSpace(catalog.Name))
                return BadRequest("Name is required.");

            _context.Catalogs.Add(catalog);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = catalog.Id }, catalog);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Catalog catalog)
        {
            var existing = await _context.Catalogs.FindAsync(id);
            if (existing == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(catalog.Name))
                return BadRequest("Name is required.");

            existing.Name = catalog.Name;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var catalog = await _context.Catalogs.FindAsync(id);
            if (catalog == null)
                return NotFound();

            _context.Catalogs.Remove(catalog);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
