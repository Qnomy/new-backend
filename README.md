Register a new user:
method: post
url: http://host/v1/auth/register
body: {"phone_number": "+972528812829"}
result: {"request_id": "xyz"}

Verify the sms (once we get the code):
method: post
url: localhost:3000/v1/auth/verify
body {"code": "{SMS_CODE}", "request_id": "{RETURNED_FROM_REGISTER}", "phone_number":"+972528812829"}

result:
 {
   "has_accounts": false,
   "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpZCI6IjU3MWVmNTE0MzI1NmY3MTgyODAxYTFiZCIsInJvbGUiOjEsInRva2VuX3R5cGUiOjEsImlhdCI6MTQ2MTY0NjYyNSwiZXhwIjoxNDYxNzMzMDI1LCJpc3MiOiJCdWJibGVZb3UiLCJzdWIiOiJhdXRoIn0.3uspD1Dt9YT5YkCQ_vV6TMLzsGARlOvL-ml6chNrXKPJ5FtWz438RzTbWH-8Vzt5eEqir6T6hocnLAqqlahepQ",
   "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpZCI6IjU3MWVmNTE0MzI1NmY3MTgyODAxYTFiZCIsInJvbGUiOjEsInRva2VuX3R5cGUiOjIsImlhdCI6MTQ2MTY0NjYyNSwiaXNzIjoiQnViYmxlWW91Iiwic3ViIjoiYXV0aCJ9.zhDUjQE1AEs1549IYJa4unyDrd4X3fBcMvpCdJQTlrKsjrZ5_DrD2hqzzyNltxhgu3vxVRTBfU0B1eTHc0qQWQ",
   "uid": "571ef5143256f7182801a1bd"
 }

Secured Api:

- Add social network acccounts

url: http://host/v1/auth/account/{USER_ID}
method: post
headers: Authorization: {TOKEN}
body: {
          "type": 1, "1-facebook, 2-twitter, 3-instagram"
          "social_id": "{social network identifier}",
          "token": "{social network token}",
          "meta": {WHATEVER JSON YOU WANT}
      }
result: {} //  we dont return an ID, because the user can only have one social network account for each kind.
You can request the list of social networks and cache them on the client. re-request it to have an updated version of it.

- Get the list of social network accounts:

url: http://host/v1/auth/account/{USER_ID}
method: get
headers: Authorization: {TOKEN}
body:
[
  {
    "_id": "571d13de4ed524dd14403134",
    "type": 1,
    "social_id": "asdfasdf",
    "token": "suasdkfjhadls kfadf876867",
    "meta": {
      "addrs": "Berlin",
      "email": "alan@alan.com"
    },
    "created_date": "2016-04-24T18:43:42.036Z"
  }
]

- Get the user profile information:

url: http://host/v1/auth/{USER_ID}
header: Authorization: {TOKEN}
{
  "_id": "57135f9563128e587809737d",
  "phone_number": "+972544946523",
  "__v": 4,
  "accounts": [
    {
      "_id": "571d13de4ed524dd14403134",
      "type": 1,
      "social_id": "asdfasdf",
      "token": "suasdkfjhadls kfadf876867",
      "meta": {
        "addrs": "Berlin",
        "email": "alan@alan.com"
      },
      "created_date": "2016-04-24T18:43:42.036Z"
    }
  ],
  "role": 1,
  "active": true,
  "created_date": "2016-04-17T10:04:05.829Z"
}

- UPLOAD A PICTURE TO CLOUDINARY: You will request a signature from my end, and once you have that you have all you need to
upload a picture to cloudinary and then use it however you want.

- Request an upload signature:
url: http://host/v1/upload/sign/
headers: authorization: {TOKEN}
method: post
body: NOTHING HERE
result:
{
  "signature": "20286ce20375833a42359b6bceac7e49e1ef16e6",
  "public_id": "571ef186fdc7c1a727da84a8",
  "timestamp": 1461645702,
  "api_key": "1nbW5NByG-Wpy8vQ_clKIhjABag"
}

Use the signature and the rest of the parameters to execute an upload to cloudinary, once you have the information you can embedded
it as a json in every document you add.

- Update the user profile (This is only to update his details, currently we have only two fields to work with display_name and display_pic)
url: http//host/v1/auth/{USER_ID}
headers: authorization: {TOKEN}
method: post
body: {"display_name": "supername", "display_pic":"{URL_TO_PUBLIC_PIC_FROM_CLOUDINARY}"};

- Post content:
url: http://host/v1/content/{USER_ID}
method: post
headers: authorization: {TOKEN}
body:
{
    "content": {WHATEVER_JSON_YOU_WANT-INCLUDE URL_TO_PUBLIC_PIC_FROM_CLOUDINARY},
    "latitude": 32.08,
    "longitude": 34.88
}
result: a content id
        {
          "cid": "571d31aec8c94cc8172cb22c"
        }

- Get content around you

url: http://host/v1/content//:longitude/:latitude/:min_distance/:max_distance

method: post
headers: authorization: {TOKEN}

for ex: http://host/v1/content/34%2E880000/32%2E080000/0/5000
note: Take care that the longitud and latitud needs to be url encoded, since they both are floating points (we can represent it with a comma,
just let me know whats easier on your side).

The idea is that you will be requesting pieces of data by distance. you can request from 0-100, later on from 101-200, etc, etc.
Currently is bringing up to 100 items per distance cut, im working on a way that will return you as well on another method that will be much better.

body:
{
  "result": [
    {
      "_id": "571d31aec8c94cc8172cb22c",
      "longitude": 34.88,
      "latitude": 32.08,
      "content": {
        "image": "url",
        "id": 2
      },
      "__v": 0,
      "user": {
        "uid": "57135f9563128e587809737d",
        "display_name": "supername",
        "display_pic": "pictureid"
      },
      "created_date": 1461528909374
    }
  ]
}

- Get content by id:


url: http://host/v1/content/571ef57c3256f7182801a1bf
headers: authorization: TOKEN
method: GET
