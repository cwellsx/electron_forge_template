using ElectronCgi.DotNet;
using System;

namespace Core
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Error.WriteLine("Core starting");
             
            var connection = new ConnectionBuilder()
                .WithLogging()
                .Build();
            
            connection.On<string, string>("greeting", name => {
                var response = "Hello " + name;
                Console.Error.WriteLine(response);
                return response;
            });
            
            connection.Listen();
        }
    }
}
