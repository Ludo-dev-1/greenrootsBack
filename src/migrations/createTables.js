import sequelize from "../database.js";

async function createTables() {
    try {
    await sequelize.drop();
    await sequelize.sync();

} catch (error) {
    console.log(error);
    process.exit(1);
};
};

createTables();