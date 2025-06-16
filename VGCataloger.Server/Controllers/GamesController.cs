using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

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
                    .Include(g => g.GamePlatforms).ThenInclude(gp => gp.Platform)                    
                    .Include(g => g.GameGenres).ThenInclude(gp => gp.Genre)
                    .Include(g => g.GameTags).ThenInclude(gt => gt.Tag)
                    .Select(g => new GameDto
                    {
                        Id = g.Id,
                        Title = g.Title,
                        ReleaseDate = g.ReleaseDate,
                        Platforms = g.GamePlatforms.Select(gp => gp.Platform.Name).ToList(),
                        Genres = g.GameGenres.Select(gg => gg.Genre.Name).ToList(),
                        Tags = g.GameTags.Select(gt => gt.Tag.Name).ToList()
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

        [HttpPost]
        public async Task<ActionResult<GameDto>> Post(GameDto gameDto)
        {
            // Map DTO to Game entity
            var game = new Game
            {
                Title = gameDto.Title,
                ReleaseDate = gameDto.ReleaseDate,
                GamePlatforms = new List<GamePlatform>(),
                GameGenres = new List<GameGenre>(),
                GameTags = new List<GameTag>()
            };

            // Attach platforms
            foreach (var platformName in gameDto.Platforms)
            {
                var platform = await _context.Platforms.FirstOrDefaultAsync(p => p.Name == platformName);
                if (platform != null)
                {
                    game.GamePlatforms.Add(new GamePlatform { Game = game, Platform = platform });
                }
            }

            // Attach genres
            foreach (var genreName in gameDto.Genres)
            {
                var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName);
                if (genre != null)
                {
                    game.GameGenres.Add(new GameGenre { Game = game, Genre = genre });
                }
            }

            // Attach tags
            foreach (var tagName in gameDto.Tags)
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
                if (tag != null)
                {
                    game.GameTags.Add(new GameTag { Game = game, Tag = tag });
                }
            }

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            // Prepare the response DTO
            var resultDto = new GameDto
            {
                Id = game.Id,
                Title = game.Title,
                ReleaseDate = game.ReleaseDate,
                Platforms = game.GamePlatforms.Select(gp => gp.Platform.Name).ToList(),
                Genres = game.GameGenres.Select(gg => gg.Genre.Name).ToList(),
                Tags = game.GameTags.Select(gt => gt.Tag.Name).ToList()
            };

            return CreatedAtAction(nameof(Get), new { id = game.Id }, resultDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, GameDto gameDto)
        {
            var game = await _context.Games
                .Include(g => g.GamePlatforms)
                .Include(g => g.GameGenres)
                .Include(g => g.GameTags)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (game == null)
            {
                return NotFound();
            }

            // Update basic properties
            game.Title = gameDto.Title;
            game.ReleaseDate = gameDto.ReleaseDate;

            // Update platforms
            _context.GamePlatforms.RemoveRange(game.GamePlatforms);
            game.GamePlatforms.Clear();
            foreach (var platformName in gameDto.Platforms)
            {
                var platform = await _context.Platforms.FirstOrDefaultAsync(p => p.Name == platformName);
                if (platform != null)
                {
                    game.GamePlatforms.Add(new GamePlatform { GameId = game.Id, PlatformId = platform.Id, Platform = platform, Game = game });
                }
            }

            // Update genres
            _context.GameGenres.RemoveRange(game.GameGenres);
            game.GameGenres.Clear();
            foreach (var genreName in gameDto.Genres)
            {
                var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == genreName);
                if (genre != null)
                {
                    game.GameGenres.Add(new GameGenre { GameId = game.Id, GenreId = genre.Id, Genre = genre, Game = game });
                }
            }

            // Update tags
            _context.GameTags.RemoveRange(game.GameTags);
            game.GameTags.Clear();
            foreach (var tagName in gameDto.Tags)
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
                if (tag != null)
                {
                    game.GameTags.Add(new GameTag { GameId = game.Id, TagId = tag.Id, Tag = tag, Game = game });
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var game = await _context.Games
                .Include(g => g.GamePlatforms)
                .Include(g => g.GameGenres)
                .Include(g => g.GameTags)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (game == null)
            {
                return NotFound();
            }

            // Remove related join entities
            _context.GamePlatforms.RemoveRange(game.GamePlatforms);
            _context.GameGenres.RemoveRange(game.GameGenres);
            _context.GameTags.RemoveRange(game.GameTags);

            // Remove the game
            _context.Games.Remove(game);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}