using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers;

[Route("genres")]
public class GenresController(AppDbContext context) : LovControllerBase<Genre>(context);
