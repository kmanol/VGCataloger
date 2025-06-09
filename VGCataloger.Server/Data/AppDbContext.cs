using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Game> Games { get; set; }
        public DbSet<GameGenre> GameGenres { get; set; }
        public DbSet<GamePlatform> GamePlatforms { get; set; }
        public DbSet<GameTag> GameTags { get; set; }

        public DbSet<Genre> Genres { get; set; }
        public DbSet<Platform> Platforms { get; set; }
        public DbSet<Tag> Tags { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<GamePlatform>().HasKey(gp => new { gp.GameId, gp.PlatformId });
            modelBuilder.Entity<GameGenre>().HasKey(gp => new { gp.GameId, gp.GenreId });            
            modelBuilder.Entity<GameTag>().HasKey(gp => new { gp.GameId, gp.TagId });
        }
    }
}