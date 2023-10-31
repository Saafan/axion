module.exports = class Classroom {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
      this.utils = utils;
      this.config = config;
      this.cortex = cortex;
      this.validators = validators;
      this.mongomodels = mongomodels;
      this.tokenManager = managers.token;
      this.classroomsCollection = "classrooms";
      this.httpExposed = ["createClassroom", "editClassroomName", "get=getListAllClassroomsForSchool","get=getClassroomInfo"];
    }
  
    async createClassroom({__token, name, schoolId , createdBy}) {

      if(!["superadmin", "admin"].includes(await this.utils.getUserTypeByToken(__token)))
        return {message: "User unauthorized to perform this action"};

      const classroom = { name, schoolId, createdBy };
  
      // Data validation
      let result = await this.validators.classroom.createClassroom(classroom);
      if (result) return result; // if there is an error, return it
      
      // Check if the School exists
      let schoolValidation      = await this.utils.existingItem(this.mongomodels.school, "_id", schoolId);
      if (schoolValidation.error) return schoolValidation;    

      // Check if the User exists
      let userValidation        = await this.utils.existingItem(this.mongomodels.user, "_id", createdBy);
      if (userValidation.error) return userValidation;
      

      // Creation Logic
      let createdClassroom;
      try {
        createdClassroom     = await this.mongomodels.classroom.create(classroom);
      } catch (e) {
        return {error : e.message }
      }
      
      // Check if the classroom was created successfully)
      if (createdClassroom) {
        console.log(`Classroom with name "${name}" created successfully.`);
      } else {
        console.log(`Failed to create the classroom with name "${name}".`);
      }

      // Response
      return {
        classroom: createdClassroom,
      };
    }

    async editClassroomName({__token, classroomId, classroomName})
    {
      if(!["superadmin", "admin"].includes(await this.utils.getUserTypeByToken(__token)))
        return {message: "User unauthorized to perform this action"};

      let classroom = await this.utils.existingItem(this.mongomodels.classroom, "_id", classroomId);
      if (classroom.error) return classroom;

      try
      {
        classroom.name = classroomName;
        await classroom.save();
      }
      catch(e)
      {
        return {error : e.message }
      }

      return {message: "Classroom name successfully changed"};
    }

    async getListAllClassroomsForSchool({__token, __query}) {
      if(!["superadmin", "admin"].includes(await this.utils.getUserTypeByToken(__token)))
        return {message: "User unauthorized to perform this action"};

      let school = await this.utils.existingItem(this.mongomodels.school, "_id", __query.schoolId);
      if (school.error) return school;

      let classrooms = await this.mongomodels.classroom.find({schoolId: __query.schoolId});
      
      return classrooms;
    }

    async getClassroomInfo({__token, __query}) {
      if(!["superadmin", "admin"].includes(await this.utils.getUserTypeByToken(__token)))
        return {message: "User unauthorized to perform this action"};

      let classroom = await this.utils.existingItem(this.mongomodels.classroom, "_id", __query.classroomId);
      if (classroom.error) return classroom;

      
      //Show School name and address instead of just the Id
      await classroom.populate("schoolId");

      //Show Username instead of just the Id
      await classroom.populate("createdBy", "username");

      return classroom;
    }

  };
  