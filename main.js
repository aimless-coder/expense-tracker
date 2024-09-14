#!/usr/bin/env node

import { Command } from 'commander';
import Table from 'cli-table3';
import fs from 'fs';
import path from 'path';
import os from 'os';

const program = new Command();
const filePath = './expense.json';
const globalState = {
    budget: [],
    data: [] 
};
    
const months = [
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December"
  ];

  const expenseCategories = [
    "food",
    "healthcare",
    "debt",
    "entertainment",
    "education",
    "investments",
    "utilities",
    "miscellaneous"
  ];

//Create JSON File, if not there.
const initializeFile = () => {
    if (!fs.existsSync(filePath)){
        try {
            fs.writeFileSync(filePath, JSON.stringify(globalState, null, 2));
            console.log('expense.json created.');
        } catch (error) {
            console.error('Error creating tasks.json:', error.message);
        }
    }
};

//Load JSON file whenever needed
const loadExpenses = () => {
    initializeFile();
    try {
        if (fs.existsSync(filePath)) {
            const dataBuffer = fs.readFileSync(filePath);
            const dataJSON = dataBuffer.toString();
            const loadedState = JSON.parse(dataJSON);

            globalState.budget = loadedState.budget || [];
            globalState.data = loadedState.data || [];
        }
    } catch (error) {
        console.error('Error loading tasks:', error.message);
    }
};

//Save in JSON file
const saveExpenses = () => {
    try {
        const dataJSON = JSON.stringify(globalState, null, 2);
        fs.writeFileSync(filePath, dataJSON);
    } catch (error) {
        console.error('Error saving tasks:', error.message);
    }
};

//Validate Amount is correct or not
const validateAmount = (amount) => {
    if (isNaN(amount) || parseFloat(amount) < 0) {
        console.log('Invalid amount. It must be a non-negative number.');
        process.exit(1);
    }
};

//Validate month is correct or not
const validMonth = (month) => {
    if (isNaN(month) || (parseInt(month) < 1) || (parseInt(month) > 12)) {
        console.log('Invalid month. It must be between 1 and 12.');
        process.exit(1);
    }
}

//View table
const renderTable = (data, flag) => {
    if(flag){
        const table = new Table({
        head: ['Month', 'Budget(₹)','Expense(₹)', 'Variance(₹)'],
        colWidths: [25, 25, 25, 25]
        });

        data.forEach(item => {
            const expense = addExpense(filterData(months.indexOf(item.month) + 1));
            table.push([
                item.month,
                item.budget,
                expense,
                item.budget - expense
            ]);
        });
        console.log(table.toString());
        
    } else {

        const total = addExpense(data);
        const table = new Table({
            head: ['ID', 'Description', 'Amount(₹)','Category', 'Date'],
            colWidths: [5, 30, 25, 25, 25]
        });
    
        data.forEach(item => {
            table.push([
                item.id,
                item.description,
                parseFloat(item.amount).toFixed(2),
                item.category,
                new Date(item.date).toLocaleString('en-US', { dateStyle: 'medium' })
            ]);
        });
    
        table.push([
            '', 
            'Total',
            total.toFixed(2),
            '',
            ''
          ]);
    
        console.log(table.toString());
    }
};

// Summation of expenses
const addExpense = (data) => {
    const totalExpense = data.reduce((total, item) =>{return total + parseFloat(item.amount)}, 0);
    return parseFloat(totalExpense.toFixed(2));
};

//Check category from array
const checkCategory = (item) => {
    if(item && !expenseCategories.includes(item.toLowerCase(),0)){
        console.log("Categories must be among these:");
        expenseCategories.forEach(item => console.log(item.charAt(0).toUpperCase() + item.slice(1)));
        process.exit(1);
    }
};

//Filter data whenever needed.
const filterData = (month, category) => {
    if(month){
        const inputMonth = month - 1;
        const filteredDataByMonth = globalState.data.filter(item => {
            const date = new Date(item.date);
            const month = date.getMonth();
            return (month === inputMonth);
        });

        if(!category){
            return filteredDataByMonth;   
        }else {
            checkCategory(category);
            const filteredDataByCategoryMonth = filteredDataByMonth.filter(item => item.category.toLowerCase() === category.toLowerCase());
            return filteredDataByCategoryMonth;
        }

    }else{
        checkCategory(category);
        const filteredDataByCategory = globalState.data.filter(item => item.category.toLowerCase() === category.toLowerCase());
        return filteredDataByCategory;
    }
};

//Filter Budget whenever needed
const filterBudget = (month) => {
    if(month){
        const filteredBudgetByMonth = globalState.budget.filter(item => item.month.toLowerCase() === months[month - 1].toLowerCase());
        return filteredBudgetByMonth;
    }
};

//Create new expense
const createExpense = (description, amount, category) => {  
     const expense = {
            id: globalState.data.length > 0 ?  globalState.data[globalState.data.length - 1].id + 1 : 1,
            description: description,
            amount: amount,
            category: category || "Miscellaneous",
            date: new Date(),
        };

        globalState.data.push(expense);
        saveExpenses();
        console.log(`Expense added successfully. (ID: ${expense.id})`);
};

//Update Expenses with ID
const updateExpense = (id, description, amount, category) => {

    const expenseToUpdate = globalState.data.find(item => item.id === parseInt(id));

    if(!expenseToUpdate){
        console.log(`No expense with ID:${id} found.`);
        return;
    };

    if(description || amount || category){
            expenseToUpdate.description = description || expenseToUpdate.description;
            expenseToUpdate.amount = amount || expenseToUpdate.amount;
            expenseToUpdate.category = category || expenseToUpdate.category;
            saveExpenses();
            console.log(`Updated successfully. (ID:${id})`);
        
    } else {
        console.log("Add fields to update.")
    }
};

//Delete expenses with ID.
const deleteExpense = (id) => {
    const initialLength = globalState.data.length;
    globalState.data = globalState.data.filter(data => data.id !== parseInt(id));

    if(initialLength === globalState.data.length){
        console.log(`No expense with ID:${id} found.`);
        return;
    };
    saveExpenses();
    console.log(`Deleted successfully expense with ID:${id}.`);
};

//Prepare list to be rendered
const listOfExpense = (month, category, budget) => {
    const monthIndex = month -1;
    let filteredData;

    if(budget){
        const flag = true;
        if(month){
            const filteredBudget = filterBudget(month);
            if(filteredBudget.length === 0){
                console.log(`No budget set for ${months[monthIndex]}.`)
            }else{
                console.log(`Budget history for ${months[monthIndex]} :`)
                renderTable(filteredBudget, flag);
            }
        } else {
            if(globalState.budget.length === 0){
                console.log(`No budget set.`)
            }else{
                console.log(`Budget history :`)
                renderTable(globalState.budget, flag);
            }
        }
    }else{
        if(!month && !category){
            if (globalState.data.length === 0) {
                console.log(`No data to show.`)
            } else {
              console.log(`The Expense Table: `);
              renderTable(globalState.data);
            }
        } else {
            if(month){ 
                if(category){
                    filteredData = filterData(month, category);    
                }else {
                    filteredData = filterData(month, null);
                }
    
                if (filteredData.length === 0) {
                    console.log(`No data to show ${month? `for month of ${months[monthIndex]}`:``}${category? ` in category ${category}` : `.`}`);
                } else {
                    console.log(`Table of expense${month? ` for month of ${months[monthIndex]}`:``}${category? ` in category ${category}` : `:`}`);
                    renderTable(filteredData)
                }
            }else{
                filteredData = filterData(null, category);
                if (filteredData.length === 0) {
                    console.log(`No data to show in category ${category}.`);
                } else {
                    console.log(`Table of expense for category ${category} :`);
                    renderTable(filteredData);
            }
        }
    }
} 
};

//Prepare Summary to be viewed.
const summaryOfExpense = (month, category) => {

    const inputMonth = month - 1;

    if(!category && !month){
        const totalExpense = addExpense(globalState.data);
        console.log(`Your total expense is ₹.${totalExpense}.`);

    }else if(month){ 
        if(category){
            const dataByCategoryMonth = filterData(month, category);
            const totalExpenseByCategoryMonth = addExpense(dataByCategoryMonth);
            console.log(`Your total expense of ${months[inputMonth]} for ${category} is ₹.${totalExpenseByCategoryMonth}`);

        }else {
            const dataByMonth = filterData(month, null);
            const totalExpenseByMonth = addExpense(dataByMonth);
            console.log(`Your total expense of ${months[inputMonth]} is ₹.${totalExpenseByMonth}`);
            checkBudget();
        }
    }else{
        const dataByCategory = filterData(null, category);
        const totalExpenseByCategory = addExpense(dataByCategory);
        console.log(`Your total expense for ${category} is ₹.${totalExpenseByCategory}`);
    }
};

//Create new Budget
const createBudget = (month, amount) => {
    const monthIndex = month - 1;
    const budgetExist = globalState.budget.find( item => item.month.toLowerCase() === months[monthIndex].toLowerCase());

        if(budgetExist){
            console.log(`Budget already set for ${months[monthIndex]}`)
        }else {
            const createBudget = {
                month: months[monthIndex],
                budget: amount,
            };
            globalState.budget.push(createBudget);
            saveExpenses();
            console.log(`Budget added for ${months[monthIndex]}.`);
        }
};

//Check budget against the expenditure
const checkBudget = () => {
    const date = new Date();
    const month = date.getMonth();
    const currentMonthData = globalState.budget.filter(item => item.month === months[month]);
    if(currentMonthData.length === 0){
        console.log(`Budget not set for ${months[month]}.`)
    } else {
        const budget = currentMonthData[0].budget;
        const expenseCurrentMonth = addExpense(filterData(month + 1));
        const variance = budget - expenseCurrentMonth;
        console.log(`Budget for ${months[month]} ${variance < 0 ? `exceeded by`:`left`} ₹${Math.abs(variance)}.`);
    }
};

//Convert json file into CSV and save it to Desktop
const saveAsCsv = () => {
    const filePath = './expense.json';
    
    if (!fs.existsSync(filePath)) {
        console.log('JSON file not found. Please save your data first.');
        return;
    }

    const dataBuffer = fs.readFileSync(filePath);
    const jsonData = JSON.parse(dataBuffer.toString());

    if (!jsonData || !jsonData.data || jsonData.data.length === 0) {
        console.log('No data available in JSON file.');
        return;
    }

    const csvHeaders = ['ID', 'Description', 'Amount', 'Category', 'Date'];
    const csvRows = jsonData.data.map(item => [
        item.id,
        item.description,
        item.amount,
        item.category,
        `"${new Date(item.date).toLocaleString('en-US', { dateStyle: 'medium' })}"`
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    const desktopPath = path.join(os.homedir(), 'Desktop');
    const csvFilePath = path.join(desktopPath, 'expenses.csv');

    fs.writeFileSync(csvFilePath, csvContent, 'utf-8');
    console.log(`CSV file saved successfully to ${csvFilePath}`);
};

program
  .command('add')
  .description('Add new expense.')
  .requiredOption('-d, --description <description>', 'Description of expense.')
  .requiredOption('-a, --amount <amount>', 'Amount of expense.')
  .option('-c, --category <category>', 'Category of expense.')
  .action((options) => {

    loadExpenses();
    validateAmount(options.amount);
    checkCategory(options.category);
    createExpense(options.description, options.amount, options.category);
    checkBudget();

  });


  program
  .command('update')
  .description('Update expense.')
  .requiredOption('-id, --id <id>', ' of expense.')
  .option('-d, --description <description>', 'Description of expense.')
  .option('-a, --amount <amount>', 'Amount of expense.')
  .option('-c, --category <category>', 'Category of expense.')
  .action((options) => {

    loadExpenses();
    if(options.amount){validateAmount(options.amount)};
    checkCategory(options.category);
    updateExpense(options.id, options.description, options.amount, options.category);
    
  });

program
  .command('delete')
  .description('Delete expense.')
  .requiredOption('-id, --id <id>', 'ID of expense.')
  .action((options) => {
    loadExpenses();
    deleteExpense(options.id);
  });

program
  .command('summary')
  .description('Summary of your expense.')
  .option('-m, --month <month>', 'Summary of particular month.')
  .option('-c, --category <category>', 'Category of expense.')
  .action((options) => {

    loadExpenses();
    if(options.month){validMonth(options.month)};
    summaryOfExpense(options.month, options.category);
    
  });

program
  .command('list')
  .description('List of your expense.')
  .option('-m, --month <month>', 'List of particular month.')
  .option('-c, --category <category>', 'Category of expense.')
  .option('-b, --budget', 'Show budget list.')
  .action((options) => {
    loadExpenses();
    if(options.month){validMonth(options.month)};
    checkCategory(options.category);
    listOfExpense(options.month, options.category, options.budget); 
    checkBudget();
});

program
  .command('budget')
  .description('Set a budget.')
  .requiredOption('-m, --month <month>', 'List of particular month.')
  .requiredOption('-a, --amount <amount>', 'Amount of expense.')
  .action((options) => {
    loadExpenses();
    validMonth(options.month);
    validateAmount(options.amount);
    createBudget(options.month, options.amount)
  });

  program
  .command('save')
  .description('Save file in Desktop in CSV.')
  .action(() => {
    saveAsCsv();
  });
  
  program.parse(process.argv);