namespace VGCataloger.Server.Models;

public interface INamedEntity
{
    int Id { get; set; }
    string Name { get; set; }
}
