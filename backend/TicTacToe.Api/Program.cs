using System.Text.Json.Serialization;
using TicTacToe.Api.Data;
using TicTacToe.Api.Data.Implementations;
using TicTacToe.Api.Middleware;
using TicTacToe.Api.Options;
using TicTacToe.Api.Services;
using TicTacToe.Api.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOptions<GameSessionOptions>()
    .BindConfiguration(GameSessionOptions.SectionName)
    .Validate(options => options.ExpirationMinutes > 0, "GameSession:ExpirationMinutes must be greater than zero.")
    .Validate(options => options.CleanupIntervalSeconds > 0, "GameSession:CleanupIntervalSeconds must be greater than zero.")
    .ValidateOnStart();
builder.Services.AddSingleton<IGameStore, InMemoryGameStore>();
builder.Services.AddSingleton<IScoreboardService, ScoreboardService>();
builder.Services.AddSingleton<IGameService, GameService>();
builder.Services.AddHostedService<GameSessionCleanupHostedService>();
builder.Services.AddCors(options => options.AddPolicy("local-frontend", policy =>
    policy.WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("local-frontend");
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();

var uiIndex = Path.Combine(app.Environment.WebRootPath ?? string.Empty, "index.html");
if (File.Exists(uiIndex))
{
    app.MapFallbackToFile("index.html");
}

app.Run();

public partial class Program;
