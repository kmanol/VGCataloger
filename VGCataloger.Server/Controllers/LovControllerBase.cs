using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers;

[ApiController]
public abstract class LovControllerBase<T> : ControllerBase where T : class, INamedEntity, new()
{
    private readonly AppDbContext _context;

    protected LovControllerBase(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<T>>> Get()
        => await _context.Set<T>().OrderBy(e => e.Name).ToListAsync();

    [HttpPost]
    public async Task<ActionResult<T>> Post([FromBody] T entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Name))
            return BadRequest("Name is required.");

        _context.Set<T>().Add(entity);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] T entity)
    {
        var existing = await _context.Set<T>().FindAsync(id);
        if (existing == null) return NotFound();

        if (string.IsNullOrWhiteSpace(entity.Name))
            return BadRequest("Name is required.");

        existing.Name = entity.Name;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _context.Set<T>().FindAsync(id);
        if (entity == null) return NotFound();

        _context.Set<T>().Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
