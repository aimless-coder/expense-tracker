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

const renderTable = (data, total) => {
    const table = new Table({
        head: ['ID', 'Description', 'Amount(₹)', 'Date'],
        colWidths: [5, 30, 25, 25]
    });

    data.forEach(item => {
        table.push([
            item.id,
            item.description,
            parseFloat(item.amount).toFixed(2),
            new Date(item.date).toLocaleString('en-US', { dateStyle: 'medium' })
        ]);
    });

    table.push([
        '', 
        'Total',
        total.toFixed(2),
        ''
      ]);

    console.log(table.toString());
};

const addExpense = (data) => {

    const totalExpense = data.reduce((total, item) =>{return total + parseFloat(item.amount)}, 0);
    return parseFloat(totalExpense.toFixed(2));
};

program
  .command('add')
  .description('Add new expense.')
  .requiredOption('-d, --description <description>', 'Description of expense.')
  .requiredOption('-a, --amount <amount>', 'Amount of expense.')
  .action((options) => {
    loadExpenses();
    if(options.amount < 0){
        console.log("Amount cannot be negative.");
    }else{
        const createExpense = {
            id: globalState.data.length > 0 ?  globalState.data[globalState.data.length - 1].id + 1 : 1,
            description: options.description,
            amount: options.amount,
            date: new Date(),
        };
        globalState.data.push(createExpense);
        saveExpenses();
        console.log(`Expense added successfully. (ID: ${createExpense.id})`);
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
  .action((options) => {
    loadExpenses();
    if(options.month){
        const inputMonth = options.month -1;

        const filteredData = globalState.data.filter(item => {
            const date = new Date(item.date);
            const month = date.getMonth();
            return (month === inputMonth);
        });

        const totalExpenseByMonth = addExpense(filteredData);
        console.log(`Your total expense of ${months[inputMonth]} is ₹.${totalExpenseByMonth}`);
        
    }else{
        const totalExpense = addExpense(globalState.data);
        console.log(`Your total expense is ₹.${totalExpense}.`)
    }
  });

program
  .command('list')
  .description('List of your expense.')
  .option('-m, --month <month>', 'List of particular month.')
  .action((options) => {
    loadExpenses();
    if(options.month){
        const inputMonth = options.month -1;
        const filteredData = globalState.data.filter(item => {
            const date = new Date(item.date);
            const month = date.getMonth();
            return (month === inputMonth);
        });

        if (filteredData.length === 0) {
            console.log(`No data to show for month ${inputMonth}.`)
        } else {
          console.log(`The Expense Table for ${months[inputMonth]}: `);
          const totalExpenseByMonth = addExpense(filteredData);
          renderTable(filteredData, totalExpenseByMonth);
        }
    }else{
        if (globalState.data.length === 0) {
            console.log(`No data to show.`)
        } else {
          console.log(`The Expense Table: `);
          const totalExpense = addExpense(globalState.data);
          renderTable(globalState.data, totalExpense);
        }
}});


  program.parse(process.argv);