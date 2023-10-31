const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.utils               = utils;
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.httpExposed         = ['createUser', 'login', 'get=getUserInfo', 'assignUserAsAdmin', 'assignUserAsStudent', 'editUsernameOrEmail'];
    }

    async createUser({username, email, password}){
        const user = {username, email, password};

        // Data validation
        let result = await this.validators.user.createUser(user);
        if(result) return result; // if there is an error return it
        
        const hashedPassword    = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword;

        // Creation Logic
        let createdUser         = await this.mongomodels.user.create(user);
        let longToken           = this.tokenManager.genLongToken({userId: createdUser._id });
        

        // Check if the User was created successfully
        if (createdUser) {
            console.log(`User with name "${username}" created successfully.`);
        } else {
            console.log(`Failed to create the user with username "${username}".`);
        }
    
        // Response
        return {
            longToken 
        };
    }

    async assignUserAsAdmin({__token, username})
    {
        if((await this.utils.getUserTypeByToken(__token)) == "superadmin")
        {
            let user                  = await this.utils.existingItem(this.mongomodels.user, "username", username);
            if (user.error) return {error: "The user to be assigned as admin does not exist"};
            user.type = "admin";
            await user.save();
            return {message: "User successfully assigned as admin"};
        }
        else
        {
            return {message: "User unauthorized to perform this action"};
        }
    }

    async assignUserAsStudent({__token, username})
    {
        if(["superadmin", "admin"].includes(await this.utils.getUserTypeByToken(__token)))
        {
            let user                  = await this.utils.existingItem(this.mongomodels.user, "username", username);
            if (user.error) return {error: "The user to be assigned as student does not exist"};
            user.type = "student";
            await user.save();
            return {message: "User successfully assigned as student"};
        }
        else
        {
            return {message: "User unauthorized to perform this action"};
        }
    }

    async login({username, password}) {
        
        // Check if the User exists
        let user                        = await this.utils.existingItem(this.mongomodels.user, "username", username);
        if (user.error) return user;

        try {
            // Check if the password is correct
            const isPasswordValid       = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                console.log(`Login for user ${username} successful`);
            } else {
                return ('Login failed');
            }
        } catch (e) {
          return {error: `Error during login ${e.meesage}`};
        }
        
        let longToken            = this.tokenManager.genLongToken({userId: user._id });
        let shortToken           = this.tokenManager.genShortToken({userId: user._id });
        // Response
        return {
            longToken: longToken,
            shortToken: shortToken
        };
    }

    async editUsernameOrEmail({__token, username, email}) {
        // Check if the User exists
        let user                        = await this.utils.existingItem(this.mongomodels.user, "_id", __token.userId);
        if (user.error) return user;

        // Edit Logic
        if(username) user.username = username;
        if(email) user.email = email;
        await user.save();

        // Response
        return {
            message: "User edited successfully"
        };
    }


    async getUserInfo({__token}){
        
        // Check if the User exists and return it
        let user                  = await this.utils.existingItem(this.mongomodels.user, "_id", __token.userId);
        if (user.error) return user;

        return {username: user.username, email: user.email};
    }

}
