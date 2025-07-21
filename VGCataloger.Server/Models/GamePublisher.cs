namespace VGCataloger.Server.Models
{
    public class GamePublisher
    {
        public int GameId { get; set; }
        public required Game Game { get; set; }

        public int PublisherId { get; set; }
        public required Publisher Publisher { get; set; }
    }
}