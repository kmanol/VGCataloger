using Microsoft.EntityFrameworkCore;

namespace VGCataloger.Server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Game> Games { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    }
}