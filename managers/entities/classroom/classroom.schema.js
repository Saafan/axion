// classroom.schema.js
module.exports = {
    createClassroom: [
      {
        model: "name",
        required: true,
      },
      {
        model: "schoolId",
        required: true
      },
      {
        model: "createdBy",
        required: true
      },
    ],
  };
  