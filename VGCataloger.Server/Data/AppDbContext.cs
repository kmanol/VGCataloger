using Microsoft.EntityFrameworkCore;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Game> Games { get; set; }
        public DbSet<GamePlatform> GamePlatforms { get; set; }

        public DbSet<Platform> Platforms { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<GamePlatform>()
                .HasKey(gp => new { gp.GameId, gp.PlatformId });
        }
    }
}