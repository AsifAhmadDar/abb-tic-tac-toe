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
            GameNotFoundException => StatusCodes.Status404NotFound,
            GameRuleException ruleException => ruleException.StatusCode,
            _ => StatusCodes.Status500InternalServerError
        };

        var message = exception is GameNotFoundException or GameRuleException
            ? exception.Message
            : "The game service could not complete that request.";

        await context.Response.WriteAsync(JsonSerializer.Serialize(new { message }));
    }
}
