using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("genres")]
    public class GenresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GenresController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Genre>>> Get()
        {
            return await _context.Genres.OrderBy(p => p.Name).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Genre>> Post([FromBody] Genre genre)
        {
            if (string.IsNullOrWhiteSpace(genre.Name))
                return BadRequest("Name is required.");

            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = genre.Id }, genre);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Genre genre)
        {
            var existing = await _context.Genres.FindAsync(id);
            if (existing == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(genre.Name))
                return BadRequest("Name is required.");

            existing.Name = genre.Name;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
