using System.Text.Json;
using Microsoft.AspNetCore.Authentication;

namespace WebApi.Helpers.Serializers;

public class JsonDataSerializer<TModel> : IDataSerializer<TModel>
{
    public byte[] Serialize(TModel model)
    {
        return JsonSerializer.SerializeToUtf8Bytes(model);
    }

    public TModel? Deserialize(byte[] data)
    {
        return JsonSerializer.Deserialize<TModel>(data);
    }
}