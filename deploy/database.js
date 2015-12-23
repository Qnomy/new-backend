/**
 * Created by alan on 12/20/15.
 */

/*

use user_db
db.createCollection("users")
db.users.createIndex({token: 1}, {unique:true})
db.users.createIndex({user: 1, pass:1})
db.users.createIndex( { "accounts.type": 1 , "accounts.social_id":1} )

db.users.insert(
     {
        display_pic: "",
        display_name: "Yarivos",
        token_expiration: 1513853262000,
        token_refresh: "9087513d-13d1-4c66-940e-d5921f98b7ea",
        token: "2c5848a9-7b96-4012-9f8f-e7f6faeb3281",
        accounts: [
            {
            type: NumberInt(1)
            }
        ],
        role: NumberInt(2)
     }
)


*/