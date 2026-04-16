using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using VGCataloger.Server;
using VGCataloger.Server.Data;
using VGCataloger.Server.DTOs;
using VGCataloger.Server.Models;
using VGCataloger.Server.Services;

namespace VGCataloger.Tests;

/// <summary>
/// Integration tests for GamesService using an in-memory SQLite database.
/// Each test gets a fresh database via a dedicated SqliteConnection.
/// </summary>
public class GamesServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _context;
    private readonly GamesService _sut;

    public GamesServiceTests()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new AppDbContext(options);
        _context.Database.EnsureCreated();

        _sut = new GamesService(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }

    // --- helpers ---

    private Platform SeedPlatform(string name)
    {
        var p = new Platform { Name = name };
        _context.Platforms.Add(p);
        _context.SaveChanges();
        return p;
    }

    private Genre SeedGenre(string name)
    {
        var g = new Genre { Name = name };
        _context.Genres.Add(g);
        _context.SaveChanges();
        return g;
    }

    private Status SeedStatus(string name)
    {
        var s = new Status { Name = name };
        _context.Statuses.Add(s);
        _context.SaveChanges();
        return s;
    }

    private Catalog SeedCatalog(string name)
    {
        var c = new Catalog { Name = name };
        _context.Catalogs.Add(c);
        _context.SaveChanges();
        return c;
    }

    private Game SeedGame(string title, int? userRating = null, int? steamAppId = null,
        Platform? platform = null, Genre? genre = null, Status? status = null, Catalog? catalog = null)
    {
        var game = new Game
        {
            Title = title,
            ReleaseDate = new DateTime(2020, 1, 1),
            UserRating = userRating,
            SteamAppId = steamAppId,
            GameDevelopers = new List<GameDeveloper>(),
            GamePublishers = new List<GamePublisher>(),
            GameTags = new List<GameTag>(),
        };

        if (platform != null) game.GamePlatforms.Add(new GamePlatform { Game = game, Platform = platform });
        if (genre != null) game.GameGenres.Add(new GameGenre { Game = game, Genre = genre });
        if (status != null) game.GameStatuses.Add(new GameStatus { Game = game, Status = status });
        if (catalog != null) game.GameCatalogs.Add(new GameCatalog { Game = game, Catalog = catalog });

        _context.Games.Add(game);
        _context.SaveChanges();
        return game;
    }

    // --- GetGamesAsync ---

    [Fact]
    public async Task GetGamesAsync_ReturnsAllGames_WhenNoFilters()
    {
        SeedGame("Alpha");
        SeedGame("Beta");
        SeedGame("Gamma");

        var result = await _sut.GetGamesAsync(new GamesQuery());

        Assert.Equal(3, result.TotalCount);
        Assert.Equal(3, result.Items.Count);
    }

    [Fact]
    public async Task GetGamesAsync_FiltersByTitle()
    {
        SeedGame("Dark Souls");
        SeedGame("Elden Ring");
        SeedGame("Dark Tide");

        var result = await _sut.GetGamesAsync(new GamesQuery(Search: "Dark"));

        Assert.Equal(2, result.TotalCount);
        Assert.All(result.Items, g => Assert.Contains("Dark", g.Title));
    }

    [Fact]
    public async Task GetGamesAsync_FiltersByPlatform()
    {
        var pc = SeedPlatform("PC");
        var ps5 = SeedPlatform("PS5");
        SeedGame("PC Game", platform: pc);
        SeedGame("PS5 Game", platform: ps5);
        SeedGame("Another PC Game", platform: pc);

        var result = await _sut.GetGamesAsync(new GamesQuery(Platform: "PC"));

        Assert.Equal(2, result.TotalCount);
        Assert.All(result.Items, g => Assert.Contains("PC", g.Platforms));
    }

    [Fact]
    public async Task GetGamesAsync_FiltersByGenre()
    {
        var rpg = SeedGenre("RPG");
        var fps = SeedGenre("FPS");
        SeedGame("RPG Game", genre: rpg);
        SeedGame("FPS Game", genre: fps);

        var result = await _sut.GetGamesAsync(new GamesQuery(Genre: "RPG"));

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("RPG Game", result.Items[0].Title);
    }

    [Fact]
    public async Task GetGamesAsync_FiltersByStatus()
    {
        var playing = SeedStatus("Playing");
        var completed = SeedStatus("Completed");
        SeedGame("Current Game", status: playing);
        SeedGame("Done Game", status: completed);

        var result = await _sut.GetGamesAsync(new GamesQuery(Status: "Playing"));

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Current Game", result.Items[0].Title);
    }

    [Fact]
    public async Task GetGamesAsync_FiltersByCatalog()
    {
        var wishlist = SeedCatalog("Wishlist");
        var owned = SeedCatalog("Owned");
        SeedGame("Wanted Game", catalog: wishlist);
        SeedGame("My Game", catalog: owned);

        var result = await _sut.GetGamesAsync(new GamesQuery(Catalog: "Wishlist"));

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Wanted Game", result.Items[0].Title);
    }

    [Fact]
    public async Task GetGamesAsync_FiltersByMinRating()
    {
        SeedGame("Low Rated", userRating: 2);
        SeedGame("High Rated", userRating: 4);
        SeedGame("Top Rated", userRating: 5);

        var result = await _sut.GetGamesAsync(new GamesQuery(MinRating: 4));

        Assert.Equal(2, result.TotalCount);
        Assert.All(result.Items, g => Assert.True(g.UserRating >= 4));
    }

    [Fact]
    public async Task GetGamesAsync_Paginates_Correctly()
    {
        for (int i = 1; i <= 10; i++)
            SeedGame($"Game {i:D2}");

        var page1 = await _sut.GetGamesAsync(new GamesQuery(Page: 1, PageSize: 4));
        var page2 = await _sut.GetGamesAsync(new GamesQuery(Page: 2, PageSize: 4));
        var page3 = await _sut.GetGamesAsync(new GamesQuery(Page: 3, PageSize: 4));

        Assert.Equal(10, page1.TotalCount);
        Assert.Equal(4, page1.Items.Count);
        Assert.Equal(4, page2.Items.Count);
        Assert.Equal(2, page3.Items.Count);
    }

    [Fact]
    public async Task GetGamesAsync_ReturnsItemsAlphabetically()
    {
        SeedGame("Zelda");
        SeedGame("Alpha");
        SeedGame("Mario");

        var result = await _sut.GetGamesAsync(new GamesQuery());

        Assert.Equal(new[] { "Alpha", "Mario", "Zelda" }, result.Items.Select(g => g.Title));
    }

    // --- CreateGameAsync ---

    [Fact]
    public async Task CreateGameAsync_PersistsGame()
    {
        var dto = new GameDto
        {
            Title = "New Game",
            ReleaseDate = new DateTime(2023, 6, 1),
            Developers = [],
            Publishers = [],
            Platforms = [],
            Genres = [],
            Tags = [],
            Statuses = [],
            Catalogs = [],
            UserRating = 3,
            SteamAppId = 12345
        };

        var result = await _sut.CreateGameAsync(dto);

        Assert.True(result.Id > 0);
        Assert.Equal("New Game", result.Title);
        Assert.Equal(3, result.UserRating);
        Assert.Equal(12345, result.SteamAppId);
        Assert.Equal(1, await _context.Games.CountAsync());
    }

    [Fact]
    public async Task CreateGameAsync_AttachesExistingPlatform()
    {
        SeedPlatform("PC");

        var dto = new GameDto
        {
            Title = "PC Game",
            ReleaseDate = DateTime.UtcNow,
            Developers = [],
            Publishers = [],
            Platforms = ["PC"],
            Genres = [],
            Tags = [],
            Statuses = [],
            Catalogs = []
        };

        var result = await _sut.CreateGameAsync(dto);

        Assert.Contains("PC", result.Platforms);
    }

    // --- DeleteGameAsync ---

    [Fact]
    public async Task DeleteGameAsync_RemovesGame()
    {
        var game = SeedGame("To Delete");

        var deleted = await _sut.DeleteGameAsync(game.Id);

        Assert.True(deleted);
        Assert.Equal(0, await _context.Games.CountAsync());
    }

    [Fact]
    public async Task DeleteGameAsync_ReturnsFalse_WhenNotFound()
    {
        var result = await _sut.DeleteGameAsync(999);

        Assert.False(result);
    }

    // --- UpdateGameAsync ---

    [Fact]
    public async Task UpdateGameAsync_UpdatesTitle()
    {
        var game = SeedGame("Old Title");

        var dto = new GameDto
        {
            Title = "New Title",
            ReleaseDate = game.ReleaseDate,
            Developers = [],
            Publishers = [],
            Platforms = [],
            Genres = [],
            Tags = [],
            Statuses = [],
            Catalogs = []
        };

        var updated = await _sut.UpdateGameAsync(game.Id, dto);

        Assert.True(updated);
        var saved = await _context.Games.FindAsync(game.Id);
        Assert.Equal("New Title", saved!.Title);
    }

    [Fact]
    public async Task UpdateGameAsync_ReturnsFalse_WhenNotFound()
    {
        var dto = new GameDto
        {
            Title = "X",
            ReleaseDate = DateTime.UtcNow,
            Developers = [],
            Publishers = [],
            Platforms = [],
            Genres = [],
            Tags = [],
            Statuses = [],
            Catalogs = []
        };

        var result = await _sut.UpdateGameAsync(999, dto);

        Assert.False(result);
    }
}
