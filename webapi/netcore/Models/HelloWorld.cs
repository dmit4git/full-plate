using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace webapi.Models
{
    public record HelloWorldRequest
    {
        public string Value {get; init;} = "";
    }

    public record HelloWorldResponse
    {
        public string Value {get; init;} = "";
    }
}