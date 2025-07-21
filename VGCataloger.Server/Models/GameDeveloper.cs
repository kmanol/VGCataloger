namespace VGCataloger.Server.Models
{
    public class GameDeveloper
    {
        public int GameId { get; set; }
        public required Game Game { get; set; }

        public int DeveloperId { get; set; }
        public required Developer Developer { get; set; }
    }
}