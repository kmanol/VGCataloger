using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Game> Games { get; set; }
        public DbSet<GameCatalog> GameCatalogs { get; set; }
        public DbSet<GameDeveloper> GameDevelopers { get; set; }
        public DbSet<GameGenre> GameGenres { get; set; }
        public DbSet<GamePlatform> GamePlatforms { get; set; }
        public DbSet<GamePublisher> GamePublishers { get; set; }
        public DbSet<GameStatus> GameStatuses { get; set; }
        public DbSet<GameTag> GameTags { get; set; }

        public DbSet<Catalog> Catalogs { get; set; }
        public DbSet<Developer> Developers { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Platform> Platforms { get; set; }
        public DbSet<Publisher> Publishers { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<Tag> Tags { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<GameCatalog>().HasKey(gc => new { gc.GameId, gc.CatalogId });
            modelBuilder.Entity<GameDeveloper>().HasKey(gd => new { gd.GameId, gd.DeveloperId });
            modelBuilder.Entity<GameGenre>().HasKey(gp => new { gp.GameId, gp.GenreId });
            modelBuilder.Entity<GamePlatform>().HasKey(gp => new { gp.GameId, gp.PlatformId });
            modelBuilder.Entity<GamePublisher>().HasKey(gp => new { gp.GameId, gp.PublisherId });
            modelBuilder.Entity<GameTag>().HasKey(gp => new { gp.GameId, gp.TagId });
            modelBuilder.Entity<GameStatus>().HasKey(gs => new { gs.GameId, gs.StatusId });
        }
    }
}