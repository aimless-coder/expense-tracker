#!/usr/bin/env node

import { Command } from 'commander';
import { loadExpenses, validateAmount, checkCategory, checkBudget, summaryOfExpense, listOfExpense, createBudget, createExpense, updateExpense, deleteExpense, validMonth } from './main.js';

const program = new Command();

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