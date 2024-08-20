const inquirer = require('inquirer');
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
        console.log("option selected:", answer.option)
    });
}

employeeTrackerMenu();
