/**
 * Created by alan on 12/27/15.
 */
module.exports = {
    build: function (accountType, requestBody){
        if (accountType == AccountTypes.Facebook){
            this.buildFacebook(requestBody);
        } else if (accountType == AccountTypes.Twitter){
            this.buildTwitter(requestBody);
        } else if (accountType == AccountTypes.Instagram){
            this.buildInstagram(requestBody);
        }
    },
    buildFacebook : function (requestBody){
        return {
            token_xpires: requestBody.expires,
            gender: requestBody.gender,
            email: requestBody.email,
            birthday: requestBody.birthday,
            age_range: requestBody.age_range,
            hometown: requestBody.hometown,
            location: requestBody.location,
            timezone: requestBody.timezone
        };
    },
    buildTwitter: function (requestBody){
        return {
            token_secret: requestBody.token_secret,
            name: requestBody.name,
            email: requestBody.email,
            location: requestBody.location,
            timezone: requestBody.timezone,
            screen_name: requestBody.screen_name,
            followers_count: requestBody.followers_count,
            faviourites_count: requestBody.faviourites_count,
            friends_count: requestBody.friends_count,
            statuses_count: requestBody.statuses_count
        };
    },
    buildInstagram: function (requestBody){
        return { };
    }

}