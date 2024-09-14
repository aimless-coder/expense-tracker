#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import Table from 'cli-table3';

const program = new Command();
const filePath = './expense.json';
const globalState = {data: [] };
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
            fs.writeFileSync(filePath, JSON.stringify(globalState.data, null, 2));
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
            globalState.data = JSON.parse(dataJSON);
        }
    } catch (error) {
        console.error('Error loading tasks:', error.message);
    }
};

//Save in JSON file
const saveExpenses = () => {
    try {
        const dataJSON = JSON.stringify(globalState.data, null, 2);
        fs.writeFileSync(filePath, dataJSON);
    } catch (error) {
        console.error('Error saving tasks:', error.message);
    }
};

const renderTable = (data) => {
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
};

const addExpense = (data) => {
    const totalExpense = data.reduce((total, item) =>{return total + parseFloat(item.amount)}, 0);
    return parseFloat(totalExpense.toFixed(2));
};

const checkCategory = (item) => {
    if(item && !expenseCategories.includes(item.toLowerCase(),0)){
        console.log("Categories must be among these:");
        expenseCategories.forEach(item => console.log(item.charAt(0).toUpperCase() + item.slice(1)));
        process.exit(1);
    }
}

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

program
  .command('add')
  .description('Add new expense.')
  .requiredOption('-d, --description <description>', 'Description of expense.')
  .requiredOption('-a, --amount <amount>', 'Amount of expense.')
  .option('-c, --category <category>', 'Category of expense.')
  .action((options) => {

    loadExpenses();
    checkCategory(options.category);

    if(options.amount < 0){
        console.log("Amount cannot be negative.");
    }else{
        const createExpense = {
            id: globalState.data.length > 0 ?  globalState.data[globalState.data.length - 1].id + 1 : 1,
            description: options.description,
            amount: options.amount,
            category: options.category || "Miscellaneous",
            date: new Date(),
        };
        globalState.data.push(createExpense);
        saveExpenses();
        console.log(`Expense added successfully. (ID: ${createExpense.id})`);
    }
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
    checkCategory(options.category);
    
    const expenseToUpdate = globalState.data.find(item => item.id === parseInt(options.id));

    if(!expenseToUpdate){
        console.log(`No expense with ID:${options.id} found.`);
        return;
    };

    if(options.description || options.amount || options.category){
        if(options.amount < 0){
            console.log("Amount cannot be negative.");
            return;
        }else{
            expenseToUpdate.description = options.description || expenseToUpdate.description;
            expenseToUpdate.amount = options.amount || expenseToUpdate.amount;
            expenseToUpdate.category = options.category || expenseToUpdate.category;
            saveExpenses();
            console.log(`Updated successfully. (ID:${options.id})`);
        }
    } else {
        console.log("Add fields to update.")
    }
  });

program
  .command('delete')
  .description('Delete expense.')
  .requiredOption('-id, --id <id>', 'ID of expense.')
  .action((options) => {
    loadExpenses();
    const initialLength = globalState.data.length;
    globalState.data = globalState.data.filter(data => data.id !== parseInt(options.id));

    if(initialLength === globalState.data.length){
        console.log(`No expense with ID:${options.id} found.`);
        return;
    };
    saveExpenses();
    console.log(`Deleted successfully expense with ID:${options.id}.`);
  });

program
  .command('summary')
  .description('Summary of your expense.')
  .option('-m, --month <month>', 'Summary of particular month.')
  .option('-c, --category <category>', 'Category of expense.')
  .action((options) => {
    loadExpenses();

    const inputMonth = options.month - 1;

    if(!options.category && !options.month){
        const totalExpense = addExpense(globalState.data);
        console.log(`Your total expense is ₹.${totalExpense}.`);

    }else if(options.month){ 
        if(options.category){
            const dataByCategoryMonth = filterData(options.month, options.category);
            const totalExpenseByCategoryMonth = addExpense(dataByCategoryMonth);
            console.log(`Your total expense of ${months[inputMonth]} for ${options.category} is ₹.${totalExpenseByCategoryMonth}`);

        }else {
            const dataByMonth = filterData(options.month, null);
            const totalExpenseByMonth = addExpense(dataByMonth);
            console.log(`Your total expense of ${months[inputMonth]} is ₹.${totalExpenseByMonth}`);
        }
    }else{
        const dataByCategory = filterData(null, options.category);
        const totalExpenseByCategory = addExpense(dataByCategory);
        console.log(`Your total expense for ${options.category} is ₹.${totalExpenseByCategory}`);
    }
  });

program
  .command('list')
  .description('List of your expense.')
  .option('-m, --month <month>', 'List of particular month.')
  .option('-c, --category <category>', 'Category of expense.')
  .action((options) => {
    loadExpenses();
    checkCategory(options.category);
    const inputMonth = options.month -1;
    let filteredData;

    if(!options.month && !options.category){
        if (globalState.data.length === 0) {
            console.log(`No data to show.`)
        } else {
          console.log(`The Expense Table: `);
          renderTable(globalState.data);
        }
    } else {
        if(options.month){ 
            if(options.category){
                filteredData = filterData(options.month, options.category);    
            }else {
                filteredData = filterData(options.month, null);
            }

            if (filteredData.length === 0) {
                console.log(`No data to show ${options.month? `for month of ${months[inputMonth]}`:``}${options.category? ` in category ${options.category}` : `.`}`);
            } else {
                console.log(`Table of expense${options.month? ` for month of ${months[inputMonth]}`:``}${options.category? ` in category ${options.category}` : `:`}`);
                renderTable(filteredData)
            }
        }else{
            filteredData = filterData(null, options.category);
            if (filteredData.length === 0) {
                console.log(`No data to show in category ${options.category}.`);
            } else {
                console.log(`Table of expense for category ${options.category} :`);
                renderTable(filteredData)
        }
    }
}});


  program.parse(process.argv);