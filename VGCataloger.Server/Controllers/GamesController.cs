using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;

namespace VGCataloger.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GamesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GamesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameDto>>> Get()
        {
            try
            {
                var games = await _context.Games
                    .Include(g => g.GamePlatforms)
                        .ThenInclude(gp => gp.Platform)
                    .Select(g => new GameDto
                    {
                        Id = g.Id,
                        Title = g.Title,
                        ReleaseDate = g.ReleaseDate,
                        Platforms = g.GamePlatforms.Select(gp => gp.Platform.Name).ToList()
                    })
                    .ToListAsync();

                return Ok(games);
            }
            catch (Exception ex)
            {
                // Log the exception (in production, use a logger)
                return StatusCode(500, ex.ToString());
            }
        }

    }
}