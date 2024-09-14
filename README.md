# Expense Tracker CLI

The Expense Tracker CLI is a comprehensive command-line tool designed to simplify personal finance management. Track expenses, set budgets, view summaries, and export your data with ease. This tool helps you maintain control over your finances directly from the terminal.

For more information on this project idea, visit [roadmap.sh](https://roadmap.sh/projects/expense-tracker)

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
    [Add a New Expense](#add-a-new-expense)
  - [Update an Existing Expense](#update-an-existing-expense)
  - [Delete an Expense](#delete-an-expense)
  - [View a Summary of Expenses](#view-a-summary-of-expenses)
  - [List Expenses](#list-expenses)
  - [Set a Monthly Budget](#set-a-monthly-budget)
  - [Save Expenses as CSV](#save-expenses-as-csv)
- [Expense Categories](#expense-categories)

## Features

- **Expense Management :** Add, update, and delete expenses, allowing you to keep a record of your spending.

- **Budget Tracking :** Set monthly budgets to ensure that your spending stays on track.

- **Expense Summaries :** Get an overview of your total expenses, filtered by month and/or category.

- **Expense Listings :** List all expenses, with options to filter by month, category, or show budgets.

- **CSV Export :** Export your expenses as a CSV file, enabling further analysis or sharing.

## Prerequisites


- [Node.js](https://nodejs.org/) (v12.0 or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)

## Installation

1. Clone this repository to your local machine:

    ```sh
    git clone https://github.com/aimless-coder/expense_tracker.git
    ```

2. Navigate to the project directory:

    ```sh
    cd expense-tracker
    ```

3. Install the required dependencies:

    ```sh
    npm install
    ```

4. To install the Expense Tracker CLI globally, run:

```sh
npm install -g expense-tracker
```
    
## Usage

- **Add a New Expense :** To add an expense, use the add command, specifying the description, amount, and optionally a category:


```sh
expense-tracker add --description "Grocery Shopping" --amount 200 --category food
```
- **Update an Existing Expense :** To update an existing expense, provide the expense ID along with the new details you'd like to modify:

```sh
expense-tracker update --id 1 --description "Business Dinner" --amount 350
```

- **Delete an Expense :** To remove an expense by its ID, use the delete command:

```sh
expense-tracker delete --id 1
```

- **View a Summary of Expenses :** Generate a summary of your expenses by month or category:

```sh
expense-tracker summary --month 9 --category food
```
This will display the total expenses for September in the "Food" category.

- **List Expenses :** To list your expenses, use the list command. You can filter by month, category, or show your budget history:

```sh
expense-tracker list --month 9 --category entertainment
```

- **Set a Monthly Budget :** Use the budget command to define a budget for a specific month:

```sh
expense-tracker budget --month 9 --amount 10000
```

- **Save Expenses as CSV :** You can export all your expenses into a CSV file, which will be saved to your desktop:

```sh
expense-tracker save
```


## Expense Categories

When adding or updating expenses, you can categorize them into the following categories:

- Food
- Healthcare
- Debt
- Entertainment
- Education
- Investments
- Utilities
- Miscellaneous
If no category is specified, expenses will default to "Miscellaneous."

## File Structure

The project is organized into the following main files:

```bash
.
├── command.js      # Defines the CLI commands and handles user input.
├── main.js         # Contains core logic for managing expenses, budgets, summaries, and CSV export.
├── expense.json    # Stores all expense and budget data (generated at runtime).
└── README.md       # Documentation for the project.
```