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
            
            case 'Add a Role':
                addRole();
                break;
            
            case 'Add an Employee':
                addEmployee();
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
                e.id 
                    AS employee_id, 
                e.first_name, 
                e.last_name, 
                r.title 
                    AS jobe_title, 
                d.name 
                    AS department, 
                r.salary, 
                COALESCE(
                    CONCAT(m.first_name, ' ', m.last_name), 'None') AS manager
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

const addRole = async () => {
    try {
        const departmentsQuery = await pool.query(`
            SELECT id, name
            FROM department
            `);
        const departments = departmentsQuery.rows;
        const departmentSelection = departments.map(department => ({
            name: department.name,
            value: department.id
        }));

        const answer = await inquirer.prompt(
            [
                {
                    type: 'input',
                    name: 'roleTitle',
                    message: 'What is the name of the role you wish to add?',
                    validate: input => input ? true : "Invalid input. Please try again."
                },
                {
                    type: 'input',
                    name: 'roleSalary',
                    message: "What is the role's salary",
                    validate: input => !isNaN(input) ? true : 'Invalid input. Please enter an integer.'
                },
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Select the department this role belongs to?',
                    choices: departmentSelection
                }
            ]
        );

        const result = await pool.query(`
            INSERT INTO role (title, salary, department_id)
            VALUES ($1, $2, $3)
            RETURNING id, title, salary, department_id
            `, [answer.roleTitle, answer.roleSalary, answer.departmentId]);

        console.log('New Role added.');
        employeeTrackerMenu();
    } catch (error) {
        console.log(error);
    }
};

const addEmployee = async () => {
    try {
        const rolesQuery = await pool.query(`
            SELECT id, title
            FROM role
            `);

        const employeesQuery = await pool.query(`
            SELECT id,
                CONCAT(first_name, ' ', last_name)
                    AS name
            FROM employee`)

        const roles = rolesQuery.rows;
        const employees = employeesQuery.rows

        const roleOptions = roles.map(role => ({
            name: role.title,
            value: role.id
        }))

        const managerOptions = employees.map(employee => ({
            name: employee.title,
            value: employee.id
        }))

        managerOptions.push(
            {
                name: 'None',
                value: null
            });

        const answer = await inquirer.prompt(
            [
                {
                    type: 'input',
                    name: 'firstName',
                    message: "What is the first name of the employee?",
                    validate: input => input ? true : "Invalid input. Please try again."
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "What is the last name of the employee?",
                    validate: input => input ? true : "Invalid input. Please try again."
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "What is the role of the employee?",
                    choices: roleOptions
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: 'Who is the manager of the employee?',
                    choices: managerOptions
                }
            ]
        );

        const result = await pool.query(`
            INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, first_name, last_name, role_id, manager_id
            `, [answer.firstName, answer.lastName, answer.roleId, answer.managerId]);

        console.log('New Employee added.');
        employeeTrackerMenu();
    } catch (error) {
        console.log(error);
    }
};

employeeTrackerMenu();
