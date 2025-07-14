using VGCataloger.Server.Models;

namespace VGCataloger.Server
{
    public class Game
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime ReleaseDate { get; set; }
        public int? UserRating { get; set; }

        public ICollection<GamePlatform> GamePlatforms { get; set; } = new List<GamePlatform>();
        public ICollection<GameGenre> GameGenres { get; set; } = new List<GameGenre>();
        public ICollection<GameTag> GameTags { get; set; } = new List<GameTag>();
    }
}