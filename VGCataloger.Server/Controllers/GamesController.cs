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
        public async Task<ActionResult<IEnumerable<Game>>> Get()
        {
            var games = await _context.Games.ToListAsync();
            return Ok(games);
        }
    }
}