namespace VGCataloger.Server.Models
{
    public class GameTag
    {
        public int GameId { get; set; }
        public required Game Game { get; set; }     // Navigation property

        public int TagId { get; set; }
        public required Tag Tag { get; set; }       // Navigation property
    }
}
