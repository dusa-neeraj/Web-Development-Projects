// Store all expenses
let expenses = [];

// Get elements from HTML
let incomeInput = document.getElementById("income");
let expenseInput = document.getElementById("expense");
let categoryInput = document.getElementById("category");

let addButton = document.getElementById("addExpense");

let expenseList = document.getElementById("expenseList");

let totalExpense = document.getElementById("totalExpense");
let savings = document.getElementById("savings");
let highestExpense = document.getElementById("highestExpense");
let lowestExpense = document.getElementById("lowestExpense");
let averageExpense = document.getElementById("averageExpense");
let status = document.getElementById("status");


// Add expense function
function addExpense() {

    let amount = Number(expenseInput.value);
    let category = categoryInput.value;

    if (amount <= 0 || category === "") {
        alert("Please enter a valid expense.");
        return;
    }

    expenses.push({
        category: category,
        amount: amount
    });

    displayExpenses();
    calculateAnalysis();

    expenseInput.value = "";
    categoryInput.value = "";
}


// Display expenses
function displayExpenses() {

    expenseList.innerHTML = "";

    for (let i = 0; i < expenses.length; i++) {

        let expense = expenses[i];

        let item = document.createElement("p");

        item.innerHTML =
            expense.category + " - ₹" + expense.amount;

        expenseList.appendChild(item);
    }
}


// Calculate analysis
function calculateAnalysis() {

    let total = 0;
    let highest = expenses[0].amount;
    let lowest = expenses[0].amount;

    for (let i = 0; i < expenses.length; i++) {

        total = total + expenses[i].amount;

        if (expenses[i].amount > highest) {
            highest = expenses[i].amount;
        }

        if (expenses[i].amount < lowest) {
            lowest = expenses[i].amount;
        }
    }

    let average = total / expenses.length;

    let income = Number(incomeInput.value);

    let saving = income - total;

    totalExpense.innerHTML = total;
    savings.innerHTML = saving;
    highestExpense.innerHTML = highest;
    lowestExpense.innerHTML = lowest;
    averageExpense.innerHTML = average.toFixed(2);


    // Spending status
    if (income <= 0) {
        status.innerHTML = "Enter your income";
    }
    else if (saving >= income * 0.5) {
        status.innerHTML = "Excellent";
    }
    else if (saving >= income * 0.3) {
        status.innerHTML = "Good";
    }
    else if (saving >= income * 0.1) {
        status.innerHTML = "Average";
    }
    else {
        status.innerHTML = "High Spending";
    }
}


// Button click
addButton.onclick = addExpense;