- Register new user:
url: http://localhost:3001/content/v1/post
body:
{
    "phone_number": "13123123123"
}

response:
{}


- Login new user:
url: http://localhost:3001/content/v1/post
body:
{
    "phone_number": "13123123123",
    "code": ""
}