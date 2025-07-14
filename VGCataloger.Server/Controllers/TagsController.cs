using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("tags")]
    public class TagsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TagsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tag>>> Get()
        {
            return await _context.Tags.OrderBy(p => p.Name).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Tag>> Post([FromBody] Tag tag)
        {
            if (string.IsNullOrWhiteSpace(tag.Name))
                return BadRequest("Name is required.");

            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = tag.Id }, tag);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Tag tag)
        {
            var existing = await _context.Tags.FindAsync(id);
            if (existing == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(tag.Name))
                return BadRequest("Name is required.");

            existing.Name = tag.Name;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null)
                return NotFound();

            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
