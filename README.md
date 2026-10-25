# Tic Tac Toe

## 1. Project overview

A browser-based Tic Tac Toe game with an Angular frontend and an ASP.NET Core Web API. The API owns the board, move history, game status, computer moves, undo behavior, and session scoreboard. The browser renders the latest state returned by the server.

## 2. Tech stack

- Angular 22 and TypeScript with standalone components, signals, functional guards, functional interceptors, and Vitest
- ASP.NET Core 9 controller-based Web API on .NET 9
- In-memory state with thread-safe session access
- xUnit and Coverlet for backend tests and Cobertura coverage
- SCSS themes with CSS custom properties for light and dark modes

## 3. Features implemented

- Two-player mode and play-against-computer mode
- Row, column, diagonal, and draw detection
- Winning-cell highlighting and locked completed games
- Move ledger with row and column positions
- Undo of one move in two-player mode
- Undo of the human/computer pair in computer mode
- Session scoreboard for X wins, O wins, and draws
- Separate game and scoreboard reset actions
- UUID-based sessions sent through the `SESSION-ID` header and restored from browser session storage
- Configurable session expiry with API validation and background cleanup
- Active-game mode changes with a blocking confirmation dialog and same-session reset
- Responsive layout with keyboard focus states and reduced-motion support
- Persistent dark and light themes with a header switch

The frontend theme system lives under `frontend/src/assets/styles`. Each theme has its own Sass variables and emits shared CSS custom properties through `dark-theme.scss` and `light-theme.scss`. `ThemeService` switches the root `data-theme` attribute and persists the selection in local storage.

The Angular application follows a feature-oriented structure:

```text
frontend/src/app
├── core
│   ├── directives
│   ├── guards
│   ├── interceptors
│   ├── models
│   ├── pipes
│   └── services
├── features
│   ├── game
│   └── home
├── layout
│   ├── footer
│   ├── header
│   └── shell
└── app.routes.ts
```

Application-wide infrastructure is imported through the `@core/*` alias. Feature screens own their UI and route-level behavior, while layout components own the application shell. This keeps dependencies flowing from features toward core and prevents shared infrastructure from depending on a screen.

## 4. How to run the backend locally

Install the .NET 9 SDK, then run:

```powershell
cd backend
dotnet run --project TicTacToe.Api --urls http://localhost:5050
```

The API is available at `http://localhost:5050`. A health check is available at `GET /api/health`.

## 5. How to run the frontend locally

Install Node.js 22 or newer, then run:

```powershell
cd frontend
npm install
npm run start
```

Open `http://localhost:4200`. The Angular dev server proxies `/api` requests to the backend at port 5050.

### Optional: serve the Angular build from ASP.NET Core

The Angular production build is configured to write directly to `backend/TicTacToe.Api/wwwroot`. ASP.NET Core serves those files and falls back to Angular's `index.html` for client-side routes.

Use this mode when you want one application process:

```powershell
cd frontend
npm run build
cd ../backend/TicTacToe.Api
dotnet run
```

Open `http://localhost:5050`. The same codebase also supports development mode with `dotnet run` in one terminal and `npm start` in another; Angular's proxy forwards `/api` calls to the API.

## 6. API endpoint summary

All enums are serialized as strings.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/games` | Create a game using the valid `SESSION-ID` header. Body: `{ "mode": "TwoPlayer" }` or `{ "mode": "Computer" }` |
| GET | `/api/games` | Return the `SESSION-ID`-bound game state |
| POST | `/api/games/moves` | Submit `{ "player": "X", "cellIndex": 0 }` |
| POST | `/api/games/undo` | Undo according to the selected mode |
| POST | `/api/games/reset` | Reset the board and move history; optionally change mode with `{ "mode": "Computer" }` |
| GET | `/api/scoreboard` | Return the session scoreboard |
| POST | `/api/scoreboard/reset` | Clear all scoreboard totals |

A game state contains the game id, nine-cell board, current player, mode, status, winner, winning cell indexes, move records, and scoreboard. Invalid move attempts are rejected by the API with a structured `GAME_RULE_VIOLATION` error. Out-of-range cells return `400`; occupied cells, wrong-player moves, and moves after completion return `409`. The board, move history, and scoreboard are never changed by an invalid request. Structural request errors such as malformed JSON are still handled by ASP.NET Core model validation.

Game sessions expire according to `GameSession:ExpirationMinutes` in the API configuration. Expired sessions are removed during validation and by the background cleanup service. The API returns `401` with code `SESSION_EXPIRED`; an unknown session returns `404` with code `SESSION_NOT_FOUND`.

While a game is in progress, changing the mode in the UI opens a blocking native confirmation dialog. Confirming reuses the current `SESSION-ID`, resets the board and move history, preserves the session scoreboard, applies the selected mode, and renews the session expiry. Cancelling leaves the game unchanged. Completed games can be reset into another mode without the confirmation dialog.

## 7. How to run tests

Run backend tests from the repository root. The runsettings file produces Cobertura coverage and enforces at least 90% total line and branch coverage:

```powershell
dotnet test backend/TicTacToe.sln --settings backend/coverage.runsettings --collect:"XPlat Code Coverage"
```

The test suite covers valid and invalid moves, turn changes, all win directions, draws, reset behavior, both undo modes, scoreboard updates, computer priority, and completed-game protection.

The frontend uses Angular's Vitest runner and enforces a 90% minimum for statements, lines, branches, and functions:

```powershell
cd frontend
npm test
npm run test:coverage
```

The frontend coverage report is written to `frontend/coverage`. HTML templates are excluded from the numerical threshold because Angular compiles them into generated render functions; component behavior is still exercised through the component specs.

The active game session is identified by a UUID generated by the frontend with `crypto.randomUUID()`. The Angular session service holds the UUID and session expiry details in memory and `sessionStorage`, while a functional HTTP interceptor sends it as the `SESSION-ID` header on every API request. After a normal start, the route guard uses the cached session and avoids a second GET. After a browser refresh, the in-memory game is missing, so the guard calls `GET /api/games` to restore it. No cookie or browser credential is used.

The Angular app keeps shared concerns in focused folders: `layout` contains the header and footer shell, `services` contains API/session/theme state, `guards` contains route access rules, `pipes` contains reusable display formatting, and `directives` contains interaction behavior such as outside-click suppression.

## 8. AI tools and prompt summary

AI assistance used during implementation:

- OpenAI Codex for Angular feature refactoring, backend layering, test generation, documentation, and coverage analysis.
- The prompts emphasized Vitest coverage, SOLID principles, clean separation of DTOs and domain models, session-based game flow, and a high-quality responsive interface.

## 9. Design decisions

### Backend owns state

The API uses a deliberately small service layout:

```text
TicTacToe.Api
├── Controllers
│   ├── GamesController.cs
│   ├── HealthController.cs
│   └── ScoreboardController.cs
├── Data
│   ├── IGameStore.cs
│   └── Implementations
│       └── InMemoryGameStore.cs
├── Exceptions
│   ├── GameNotFoundException.cs
│   └── GameRuleException.cs
├── Rules
│   ├── ComputerMoveSelector.cs
│   └── GameRules.cs
├── Middleware
│   └── ExceptionHandlingMiddleware.cs
├── Dtos
│   ├── Requests
│   │   ├── CreateGameRequest.cs
│   │   └── MoveRequest.cs
│   └── Responses
│       ├── GameStateResponse.cs
│       ├── MoveRecord.cs
│       └── ScoreboardResponse.cs
├── Models
│   ├── GameMode.cs
│   ├── GameMove.cs
│   ├── GameSession.cs
│   ├── GameStatus.cs
│   ├── Player.cs
│   └── ScoreboardState.cs
├── Services
│   ├── IGameService.cs
│   ├── IScoreboardService.cs
│   └── Implementations
│       ├── GameService.cs
│       └── ScoreboardService.cs
└── Program.cs
```

`GameService` owns game sessions and rules. `ScoreboardService` owns session totals. Both are registered as singleton services, and each game has its own lock. The interfaces keep HTTP mapping separate from the implementation and make the core services easy to replace or unit test.

Request and response contracts are kept separate from domain state:

- `Dtos/Requests` contains API input contracts such as `CreateGameRequest` and `MoveRequest`.
- `Dtos/Responses` contains API output contracts such as `GameStateResponse`, `MoveRecord`, and `ScoreboardResponse`.
- `Models` contains game state and domain values only. `GameMove` and `ScoreboardState` are internal state records and are never exposed directly by the API.

### Computer behavior

Computer mode treats X as the human player and O as the computer. After a valid X move, the API immediately selects O's move using this order: win, block, center, corner, then first open cell.

### Undo and completed games

This solution uses Option A from the brief. Undo is disabled after a win or draw, so the scoreboard cannot be left in a partially reversed state. A two-player undo removes one move. A computer-mode undo removes the latest X/O pair.

### Reset behavior

Reset Game clears the current board and history, returns the turn to X, and leaves the scoreboard untouched. Reset Scoreboard is a separate operation. Resetting a completed game starts a clean result-tracking state for that session.

### UI direction

The interface uses a dark glass surface, high-contrast lime and blue marks, oversized editorial type, nested card shells, and restrained transform-based motion. The board remains the main focus on a laptop, while the move ledger and scoreboard collapse below it on smaller screens.

The brief was converted into three slices: a stateful game domain, a REST boundary, and a client that renders server responses. The implementation was reviewed around the risky rules: wrong-turn validation, computer move ordering, undo semantics, and one-time scoreboard updates. The design copy was kept short and direct so labels explain the current state without competing with the board.

## 10. Clarifications and assumptions

- State is in memory and is lost when the API process stops.
- The app is designed for a local review session, so it does not include accounts or persistence.
- A session scoreboard is shared by all games handled by the running API process.
- Computer play is intentionally deterministic and follows the required priority rather than a full minimax strategy.
- The frontend creates a UUID for each game session and sends it in the `SESSION-ID` header; the API validates it on every session-bound request.
- Changing mode during an active game intentionally resets the board and move history, preserves the scoreboard, reuses the same session id, and renews the expiry time.
- X starts every new or reset game. In computer mode, X is the human player and O is the computer.

## 11. Known limitations

- The in-memory store is single-process and is not suitable for a multi-instance deployment without shared storage.
- There is no authentication or authorization; a UUID session id is an application-level game identifier, not user identity.
- A deterministic priority-based computer opponent.
- There are no realtime multiplayer connections; two-player mode relies on the current client and API session.
- API contract tests do not start a separate published production process.

## 12. Future improvements

SQLite persistence, server-side session authentication, a complete AI opponentfor VS Computer Mode, and contract tests against a live API would be natural next steps.
