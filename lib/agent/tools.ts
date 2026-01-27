export const solveConvexTool = {
  name: "solveConvex",
  description: "Solve a linear or mixed-integer programming problem to find optimal values for variables subject to constraints.",
  parameters: {
    type: "object",
    properties: {
      optimize: {
        type: "string",
        description: "The variable to optimize (e.g., 'profit', 'cost').",
      },
      opType: {
        type: "string",
        enum: ["max", "min"],
        description: "Maximize or minimize the objective.",
      },
      constraints: {
        type: "object",
        description: "Constraints object where keys are constraint names and values are objects like { min: 10, max: 20 }.",
      },
      variables: {
        type: "object",
        description: "Variables object where keys are variable names and values are objects mapping constraints/objective to coefficients.",
      },
      ints: {
        type: "object",
        description: "Object where keys are variable names that must be integers.",
      },
    },
    required: ["optimize", "opType", "constraints", "variables"],
  },
};
