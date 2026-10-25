using Microsoft.AspNetCore.Http;
using TicTacToe.Api.Exceptions;

namespace TicTacToe.Api.Controllers;

internal static class SessionIdHeader
{
    public const string Name = "SESSION-ID";

    public static Guid GetRequired(IHeaderDictionary headers)
    {
        if (!headers.TryGetValue(Name, out var value) || !Guid.TryParse(value.ToString(), out var sessionId))
        {
            throw new GameRuleException("A valid SESSION-ID header is required.");
        }

        return sessionId;
    }
}
