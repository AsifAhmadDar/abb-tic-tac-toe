using System.Text.Json;
using TicTacToe.Api.Exceptions;

namespace TicTacToe.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled request error for {Path}", context.Request.Path);
            await WriteErrorResponse(context, exception);
        }
    }

    private static async Task WriteErrorResponse(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = exception switch
        {
            GameSessionExpiredException => StatusCodes.Status401Unauthorized,
            GameNotFoundException => StatusCodes.Status404NotFound,
            GameRuleException ruleException => ruleException.StatusCode,
            _ => StatusCodes.Status500InternalServerError
        };

        var code = exception switch
        {
            GameSessionExpiredException => "SESSION_EXPIRED",
            GameNotFoundException => "SESSION_NOT_FOUND",
            GameRuleException => "GAME_RULE_VIOLATION",
            _ => "INTERNAL_ERROR"
        };

        var message = exception is GameSessionExpiredException or GameNotFoundException or GameRuleException
            ? exception.Message
            : "The game service could not complete that request.";

        await context.Response.WriteAsync(JsonSerializer.Serialize(new { code, message }));
    }
}
