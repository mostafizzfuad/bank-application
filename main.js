"use strict";
/* ---------------- DATA ---------------- */
const accounts = [
    {
        owner: "Mostafizur Rahman",
        movements: [2500, 500, -750, 1200, 3200, -1500, 500, 1400, -1750, 1800],
        interestRate: 1.5,
        password: 1234,
        movementsDates: [
            "2021-11-18T21:31:17.178Z",
            "2021-12-23T07:42:02.383Z",
            "2022-01-28T09:15:04.904Z",
            "2022-04-01T10:17:24.185Z",
            "2022-07-08T14:11:59.604Z",
            "2023-09-10T17:01:17.194Z",
            "2023-09-22T23:36:17.929Z",
            "2024-06-14T12:51:31.398Z",
            "2024-06-16T06:41:26.190Z",
            "2024-06-17T08:11:36.678Z",
        ],
        currency: "USD",
        locale: "en-US",
    },

    {
        owner: "Sunerah Binte Ayesha",
        movements: [5000, 3400, -1500, -790, -3210, -1000, 8500, -1300, 1500, -1850],
        interestRate: 1.3,
        password: 5678,
        movementsDates: [
            "2021-12-11T21:31:17.671Z",
            "2021-12-27T07:42:02.184Z",
            "2022-01-05T09:15:04.805Z",
            "2022-02-14T10:17:24.687Z",
            "2022-03-12T14:11:59.203Z",
            "2022-05-16T17:01:17.392Z",
            "2022-08-21T23:36:17.522Z",
            "2024-06-10T06:41:26.394Z",
            "2024-06-16T06:41:26.394Z",
            "2024-06-17T08:11:36.276Z",
        ],
        currency: "EUR",
        locale: "en-GB",
    },
];


/* ---------------- ELEMENTS ---------------- */
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance-value");
const labelSumIn = document.querySelector(".summary-value-in");
const labelSumOut = document.querySelector(".summary-value-out");
const labelSumInterest = document.querySelector(".summary-value-interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login-btn");
const btnTransfer = document.querySelector(".form-btn-transfer");
const btnLoan = document.querySelector(".form-btn-loan");
const btnClose = document.querySelector(".form-btn-close");
const btnSort = document.querySelector(".btn-sort");

const inputLoginUsername = document.querySelector(".login-input-username");
const inputLoginPassword = document.querySelector(".login-input-password");
const inputTransferTo = document.querySelector(".form-input-to");
const inputTransferAmount = document.querySelector(".form-input-amount");
const inputLoanAmount = document.querySelector(".form-input-loan-amount");
const inputCloseUsername = document.querySelector(".form-input-username");
const inputClosePassword = document.querySelector(".form-input-password");


/* ---------------- UPDATE UI ---------------- */
function updateUI(currentAccount) {
    displayMovements(currentAccount);
    displaySummary(currentAccount);
    displayBalance(currentAccount);
}


/* ---------------- Formatting Currency ---------------- */
function formatCurrency(value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(value);
}


/* ---------------- Days calculation ---------------- */
function formatMoveDate(date, locale) {
    const calculateDays = (date1, date2) => Math.round(Math.abs(date2 - date1) / (24 * 60 * 60 * 1000)); // find timestamp
    const daysPassed = calculateDays(new Date(), date);

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).format(date);
}


/* ---------------- USERNAME ---------------- */
function createUsernames(accounts) {
    accounts.forEach(account => {
        account.username = account.owner.toLowerCase().split(' ').map(word => word.at(0)).join('');
    })
}
createUsernames(accounts);


/* ---------------- LOGIN ---------------- */
let currentAccount, timer;

btnLogin.addEventListener('click', (e) => {
    e.preventDefault();

    currentAccount = accounts.find((account) => account.username === inputLoginUsername.value);

    if (currentAccount?.password === Number(inputLoginPassword.value)) {
        setTimeout(() => {
            // Display UI and Welcome
            labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ').at(0)}`;
            containerApp.style.opacity = 1;

            // Display Date and Time
            const now = new Date();
            const options = {
                year: "numeric",
                month: "numeric",
                day: "numeric", // day means date
                hour: "numeric",
                minute: "numeric",
            };
            labelDate.textContent = new Intl.DateTimeFormat(
                currentAccount.locale,
                options
            ).format(now);

            // Log Out Timer
            if (timer) clearInterval(timer)
            timer = logOut();

            // Update UI
            updateUI(currentAccount);
        }, 2000);

    } else {
        setTimeout(() => {
            // Hide UI and Warning SMS
            labelWelcome.textContent = "Login failed!";
            containerApp.style.opacity = 0;
        }, 2000);
    }

    // Clear Fields
    inputLoginUsername.value = inputLoginPassword.value = "";
    inputLoginPassword.blur();
})


/* ---------------- MOVEMENTS ---------------- */
function displayMovements(account, sort = false) {
    containerMovements.innerHTML = "";

    const moves = sort ? account.movements.slice(0).sort((a, b) => a - b) : account.movements;
    
    moves.forEach((move, i) => {
    const type = move > 0 ? "deposit" : "withdrawal";
    
    const formattedMove = formatCurrency(
        move,
        account.locale,
        account.currency
    );

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatMoveDate(date, account.locale);

    const html = `
        <div class="movements-row">
            <div class="movements-type movements-type-${type}">${i + 1} ${type}</div>
            <div class="movements-date">${displayDate}</div>
            <div class="movements-value">${formattedMove}</div>
        </div>
    `
    containerMovements.insertAdjacentHTML("afterbegin", html);
    })
}


/* ---------------- SUMMARY ---------------- */
function displaySummary(account) {
    // Incomes
    const incomes = account.movements.filter(move => move > 0).reduce((acc, deposit) => acc + deposit, 0);
    labelSumIn.textContent = formatCurrency(
        incomes,
        account.locale,
        account.currency
    );

    // Outcmes
    const outcomes = account.movements.filter(move => move < 0).reduce((acc, withdrawal) => acc + withdrawal, 0);
    labelSumOut.textContent = formatCurrency(
        Math.abs(outcomes),
        account.locale,
        account.currency
    );

    // Interest
    const interest = account.movements.filter(move => move > 0).map(deposit => (deposit * account.interestRate) / 100).filter(interest => interest >= 1).reduce((acc, interest) => acc + interest, 0);
    labelSumInterest.textContent = formatCurrency(
        interest,
        account.locale,
        account.currency
    );
}


/* ---------------- BALANCE ---------------- */
function displayBalance(account) {
    account.balance = account.movements.reduce((acc, balance) => acc + balance, 0);
    labelBalance.textContent = formatCurrency(
        account.balance,
        account.locale,
        account.currency
    );
}


/* ---------------- TRANSFER ---------------- */
btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();

    const receiverAccount = accounts.find(
        (account) => account.username === inputTransferTo.value
    );

    const amount = Number(inputTransferAmount.value);

    // clear fields
    inputTransferTo.value = inputTransferAmount.value = "";
    inputTransferAmount.blur();

    if (
        amount > 0 &&
        amount <= currentAccount.balance &&
        currentAccount.username !== receiverAccount.username &&
        receiverAccount
    ) {
        setTimeout(() => {
            // transfer money
            currentAccount.movements.push(-amount);
            receiverAccount.movements.push(amount);
            // add current Date And Time
            currentAccount.movementsDates.push(new Date().toISOString());
            receiverAccount.movementsDates.push(new Date().toISOString());
            // update UI
            updateUI(currentAccount);
            // show message
            labelWelcome.textContent = "Transaction successful!";
        }, 2000);

        // Log Out Timer
        if (timer) clearInterval(timer)
        timer = logOut();

    } else {
        setTimeout(() => {
            labelWelcome.textContent = "Transaction failed!";
        }, 2000);

        // Log Out Timer
        if (timer) clearInterval(timer)
        timer = logOut();
    }
});


/* ---------------- LOAN ---------------- */
btnLoan.addEventListener("click", function (e) {
    e.preventDefault();

    const amount = Number(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some((move) => move >= amount * 0.1)) {
        setTimeout(() => {
            // add positive movement into current account
            currentAccount.movements.push(amount);
            // add current time
            currentAccount.movementsDates.push(new Date().toISOString());
            // update ui
            updateUI(currentAccount);
            // message
            labelWelcome.textContent = "loan successful";
        }, 2000);

        // Log Out Timer
        if (timer) clearInterval(timer)
        timer = logOut();

    } else {
        setTimeout(() => {
            labelWelcome.textContent = "loan not successful";
        }, 2000);

        // Log Out Timer
        if (timer) clearInterval(timer)
        timer = logOut();
    }

    // clear
    inputLoanAmount.value = "";
    inputLoanAmount.blur();
});


/* ---------------- CLOSE ACCOUNT ---------------- */
btnClose.addEventListener("click", function (e) {
    e.preventDefault();

    if (
        currentAccount.username === inputCloseUsername.value &&
        currentAccount.password === Number(inputClosePassword.value)
    ) {
        const index = accounts.findIndex((account) => account.username === currentAccount.username);
        setTimeout(() => {
            // delete
            accounts.splice(index, 1);
            // hide ui
            containerApp.style.opacity = 0;
            // sms
            labelWelcome.textContent = "account deleted";
        }, 2000);

        
        // Log Out Timer
        if (timer) clearInterval(timer)
        timer = logOut();

    } else {
        setTimeout(() => {
            labelWelcome.textContent = "delete can not be done";
        }, 2000);

        // Log Out Timer
        if (timer) clearInterval(timer)
        timer = logOut();
    }

    // clear fileds
    inputCloseUsername.value = inputClosePassword.value = "";
    inputClosePassword.blur();
});


/* ---------------- SORT ---------------- */
let sortedMove = false;

btnSort.addEventListener("click", function (e) {
    e.preventDefault();

    displayMovements(currentAccount, !sortedMove);
    sortedMove = !sortedMove;
});


/* ---------------- TIMER ---------------- */
function logOut() {
    labelTimer.textContent = "";

    let time = 120;

    const clock = () => {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);

        labelTimer.textContent = `${min}:${sec}`;

        if (time === 0) {
            clearInterval(timer);
            labelWelcome.textContent = "You've been logged out!";
            containerApp.style.opacity = 0;
        }
        time--;
    };

    clock();

    timer = setInterval(clock, 1000);
    return timer;
}