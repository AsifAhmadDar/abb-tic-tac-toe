using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using TicTacToe.Api.Exceptions;
using TicTacToe.Api.Middleware;

namespace TicTacToe.Tests;

public sealed class ExceptionHandlingMiddlewareTests
{
    [Fact]
    public async Task Successful_requests_continue_through_the_middleware()
    {
        var context = new DefaultHttpContext();
        var nextCalled = false;
        var middleware = new ExceptionHandlingMiddleware(
            _ =>
            {
                nextCalled = true;
                return Task.CompletedTask;
            },
            NullLogger<ExceptionHandlingMiddleware>.Instance);

        await middleware.InvokeAsync(context);

        Assert.True(nextCalled);
    }

    [Fact]
    public async Task Session_expiry_is_returned_as_unauthorized_with_a_structured_code()
    {
        var response = await InvokeWithException(new GameSessionExpiredException(Guid.NewGuid()));

        Assert.Equal(StatusCodes.Status401Unauthorized, response.StatusCode);
        Assert.Contains("SESSION_EXPIRED", response.Body);
    }

    [Fact]
    public async Task Missing_game_is_returned_as_not_found_with_a_structured_code()
    {
        var response = await InvokeWithException(new GameNotFoundException(Guid.NewGuid()));

        Assert.Equal(StatusCodes.Status404NotFound, response.StatusCode);
        Assert.Contains("SESSION_NOT_FOUND", response.Body);
    }

    [Fact]
    public async Task Rule_errors_preserve_their_status_code_and_message()
    {
        var response = await InvokeWithException(new GameRuleException("Invalid move.", 409));

        Assert.Equal(409, response.StatusCode);
        Assert.Contains("GAME_RULE_VIOLATION", response.Body);
        Assert.Contains("Invalid move.", response.Body);
    }

    [Fact]
    public async Task Unexpected_errors_are_hidden_behind_a_generic_server_message()
    {
        var response = await InvokeWithException(new InvalidOperationException("private details"));

        Assert.Equal(StatusCodes.Status500InternalServerError, response.StatusCode);
        Assert.Contains("INTERNAL_ERROR", response.Body);
        Assert.Contains("could not complete", response.Body);
        Assert.DoesNotContain("private details", response.Body);
    }

    private static async Task<(int StatusCode, string Body)> InvokeWithException(Exception exception)
    {
        var context = new DefaultHttpContext();
        await using var stream = new MemoryStream();
        context.Response.Body = stream;
        var middleware = new ExceptionHandlingMiddleware(
            _ => Task.FromException(exception),
            NullLogger<ExceptionHandlingMiddleware>.Instance);

        await middleware.InvokeAsync(context);
        stream.Position = 0;
        using var reader = new StreamReader(stream);
        return (context.Response.StatusCode, await reader.ReadToEndAsync());
    }
}
