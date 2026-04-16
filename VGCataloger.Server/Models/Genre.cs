namespace VGCataloger.Server.Models
{
    public class Genre : INamedEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
