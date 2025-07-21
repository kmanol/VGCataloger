namespace VGCataloger.Server.Models
{
    public class GameStatus
    {
        public int GameId { get; set; }
        public required Game Game { get; set; }

        public int StatusId { get; set; }
        public required Status Status { get; set; }
    }
}