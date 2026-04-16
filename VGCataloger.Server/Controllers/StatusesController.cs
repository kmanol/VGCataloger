using Microsoft.AspNetCore.Mvc;
using VGCataloger.Server.Data;
using VGCataloger.Server.Models;

namespace VGCataloger.Server.Controllers;

[Route("statuses")]
public class StatusesController(AppDbContext context) : LovControllerBase<Status>(context);
