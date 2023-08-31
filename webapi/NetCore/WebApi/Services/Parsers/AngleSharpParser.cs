using AngleSharp.Dom;
using AngleSharp.Html.Dom;
using AngleSharp.Html.Parser;

namespace WebApi.Services.Parsers;

public class AngleSharpParser
{
    private readonly IHtmlParser _htmlParser;

    public AngleSharpParser()
    {
        _htmlParser = new HtmlParser();
    }

    public async Task<IHtmlDocument> Parse(string htmlString)
    {
        return await _htmlParser.ParseDocumentAsync(htmlString);
    }
}