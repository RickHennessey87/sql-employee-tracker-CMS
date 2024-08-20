const inquirer = require('inquirer');
const consoleTable = require('console.table');
const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'employee_db',
    password: '528Selva',
    port: 5432
});

pool.connect();

const employeeTrackerMenu = () => {
    inquirer.prompt(
        [
            {
                type: 'list',
                name: 'option',
                message: 'Welcome to the Employee Tracker. What action would you like to perform?',
                choices: [
                    'View All Departments',
                    'View All Roles',
                    'View All Emploees',
                    'Add a Department',
                    'Add a Role',
                    'Add an Employee',
                    'Update an Employee Role'
                ]
            }
        ]
    ).then((answer) => {
        switch (answer.option) {
            case 'View All Departments':
                viewAllDepartments();
                break;

            case 'View All Roles':
                viewAllRoles();
                break;

            default:
                console.log('Invalid selection. Please try again.');
                employeeTrackerMenu();
                break;
        }
    });
}

const viewAllDepartments = async () => {
    try {
        const result = await pool.query(`
            SELECT id, name 
            FROM department
        `);

        console.table(result.rows);
        employeeTrackerMenu();

    } catch (error) {
        console.log(error)
    }
}

const viewAllRoles = async () => {
    try {
        const result = await pool.query(`
            SELECT title, id, department_id, salary
            FROM role
        `);

        console.table(result.rows);
        employeeTrackerMenu();

    } catch (error) {
        console.log(error);
    }
};

employeeTrackerMenu();
