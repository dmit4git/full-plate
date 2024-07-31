using Microsoft.EntityFrameworkCore.Infrastructure;

namespace WebApi.Helpers;

public static class Waiter
{
    public static async Task Wait<T>(T obj, Func<T, Task<bool>> predicate, double timeout = 5, double delay = 0.1)
    {
        int passed = 0;
        int delayMs = (int)Math.Round(delay * 1000);
        int timeoutMs = (int)Math.Round(timeout * 1000);
        
        while (! await predicate(obj))
        {
            await Task.Delay(delayMs);
            passed += delayMs;
            if (passed > timeoutMs)
            {
                string awaited = " ";
                if (typeof(T).FullName == "Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade")
                {
                    awaited = " for database ";
                }
                throw new TimeoutException($"Waiting{awaited}has timed-out ({timeout}s)");
            }
        }
    }

    private static async Task<bool> DatabasePredicate(DatabaseFacade database)
    {
        return await database.CanConnectAsync();
    }
    
    public static async Task WaitForDatabase(DatabaseFacade database)
    {
        await Wait(database, DatabasePredicate, 30);
    }
}
