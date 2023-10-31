module.exports = class School { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.utils               = utils;
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "schools";
        this.httpExposed         = ['createSchool', 'get=getListAllSchools', 'get=getSchoolInfo', 'editSchoolName'];
    }

    async createSchool({__token, name, address, createdBy}){
        const school = {name, address, createdBy};

        if(!["superadmin", "admin"].includes(await this.utils.getUserTypeByToken(__token)))
            return {message: "User unauthorized to perform this action"};

        // Data validation
        let result                = await this.validators.school.createSchool(school);
        if(result) return result; // if there is an error return it
    
        // Check if the User exists
        let userValidation        = await this.utils.existingItem(this.mongomodels.user, "_id", createdBy);
        if (userValidation.error) return userValidation;
  
        // Creation Logic
        let createdSchool;
        try{
            createdSchool         = await this.mongomodels.school.create(school);
        } catch (e) {
            return {error : e.message }
        }


        // Check if the school was created successfully    
        if (createdSchool) {
            console.log(`School with name "${name}" created successfully.`);
        } else {
            console.log(`Failed to create the school with name "${name}".`);
        }
    

        // Response
        return {
            school: createdSchool, 
        };
    }

    async getListAllSchools({__token, __query}) {
        if(!["superadmin", "admin", "student"].includes(await this.utils.getUserTypeByToken(__token)))
            return {message: "User unauthorized to perform this action"};

        let schools = await this.mongomodels.school.find(__query);
        return {schools};
    }

    async getSchoolInfo({__token, __query}) {
        if(!["superadmin", "admin", "student"].includes(await this.utils.getUserTypeByToken(__token)))
            return {message: "User unauthorized to perform this action"};

        let school = await this.utils.existingItem(this.mongomodels.school, "_id", __query.schoolId);
        return {school};
    }

    async editSchoolName({__token, schoolId, schoolName})
    {
        if(!["superadmin", "admin"].includes(await this.utils.getUserTypeByToken(__token)))
            return {message: "User unauthorized to perform this action"};

        let school = await this.utils.existingItem(this.mongomodels.school, "_id", schoolId);
        if (school.error) return school;

        try
        {
            school.name = schoolName;
            await school.save();
        }
        catch(e)
        {
            return {error : e.message }
        }

        return {message: "School name successfully edited"};
    }
}
