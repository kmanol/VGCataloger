using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers;

[Route("tags")]
public class TagsController(AppDbContext context) : LovControllerBase<Tag>(context);
