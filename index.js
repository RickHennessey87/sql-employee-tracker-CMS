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
                    'View All Employees',
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

            case 'View All Employees':
                viewAllEmployees();
                break;

            case 'Add a Department':
                addDepartment();
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

const viewAllEmployees = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                e.id AS employee_id, 
                e.first_name, 
                e.last_name, 
                r.title AS jobe_title, 
                d.name AS department, 
                r.salary, 
                COALESCE(CONCAT(m.first_name, ' ', m.last_name), 'None') AS manager
            FROM 
                employee AS e
            JOIN 
                role AS r ON e.role_id = r.id
            JOIN
                department AS d ON r.department_id = d.id
            LEFT JOIN
                employee AS m ON e.manager_id = m.id;
        `);

        console.table(result.rows);
        employeeTrackerMenu();

    } catch (error) {
        console.log(error);
    }
};

const addDepartment = async () => {
    try {
        const answer = await inquirer.prompt(
            [
                {
                    type: 'input',
                    name: 'departmentName',
                    message: 'What is the name of the department you wish to add?',
                    validate: input => input ? true : "Invalid input. Please try again."
                }
            ]
        );
        const result = await pool.query(`
            INSERT INTO department (name)
            VALUES ('${answer.departmentName}')
            RETURNING id, name
            `);

        console.log('New Department added.');
        employeeTrackerMenu();
    } catch (error) {
        console.log(error);
    }
};

employeeTrackerMenu();
