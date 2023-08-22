using Microsoft.EntityFrameworkCore.Infrastructure;

namespace WebApi.Helpers;

public static class Waiter
{
    private static async Task Wait<T>(T obj, Predicate<T> predicate, double delay, double timeout)
    {
        int passed = 0;
        int delayMs = (int)Math.Round(delay * 1000);
        int timeoutMs = (int)Math.Round(timeout * 1000);
        
        while (!predicate(obj))
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

    private static bool DatabasePredicate(DatabaseFacade database)
    {
        return database.CanConnect();
    }
    
    public static async Task WaitForDatabase(DatabaseFacade database)
    {
        await Wait(database, DatabasePredicate, 0.5, 300);
    }
}
