namespace WebApi.Helpers.DataStructures;

public static class DictionaryHelper
{
    public static TValue GetOrSetDefault<TKey, TValue>(this IDictionary<TKey, TValue> dictionary, 
        TKey key, TValue? defaultValue) where TValue : new()
    {
        if (!dictionary.TryGetValue(key, out TValue? value))
        {
            value = defaultValue ?? new TValue();
            dictionary.Add(key, value);
        }

        return value;
    }
}