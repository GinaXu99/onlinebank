'use strict';

// Data
const account1 = {
    owner: 'Test User',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2024-01-17T14:11:59.604Z',
        '2024-01-19T17:01:17.194Z',
        '2024-01-23T23:36:17.929Z',
        '2024-01-22T10:51:36.790Z',
    ],
    currency: 'EUR', //EUR
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


let currentAccount;
/**combind update UI into one function*/
const updateUI = function (acc) {
    /**display movements */
    displayMovements(acc, false);

    /**display balance */
    calDisplayBalance(acc);

    /**display summary */
    calDisplaySummary(acc);
}

const formatCur = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(value);
}

const formateMovementDate = function (date) {
    const calcDaysPassed = (d1, d2) =>
        Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDaysPassed(new Date(), date);
    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    /**replace manual formate date with intl API */
    //else condition
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;

    const options = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    }
    return new Intl.DateTimeFormat(currentAccount.locale, options).format(date);
}

/**1. display movements*/

const displayMovements = function (acc, sort = false) {
    //clear previous items 
    containerMovements.innerHTML = '';

    /** SORTING LOGIC
     * 
     * movements.slice() -> create a copy of array not modifying original 
     * 
    */
    const ms = acc.movements;
    const movsort = sort ? ms.slice().sort((a, b) => a - b) : ms;

    movsort.forEach(function (mov, index) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';

        /**display dates */
        const date = new Date(acc.movementsDates[index]);
        const displayDate = formateMovementDate(date);
        const formattedMov = formatCur(mov, acc.locale, acc.currency);

        const html = `
        <div class="movements__row">
        <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
        </div>        
        `;
        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

/**SORTING LOGIC */
let isSorted = false;
btnSort.addEventListener('click', (e) => {
    e.preventDefault();
    displayMovements(currentAccount, !isSorted);
    isSorted = !isSorted;
});



/**2. Create username for all accounts */
const createUsernames = function (accs) {
    accs.forEach(function (acc) {
        acc.username = acc.owner.toLowerCase()
            .split(' ').map(name => name[0])
            .join('');
    })
}
createUsernames(accounts);
//console.log(accounts);


/** 3. print balance  */
const calDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

    //this is to update balance so can be used later
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);

};


/**4. display summary: in/out/interest */
const calDisplaySummary = function (acc) {
    const income = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov, movements) => acc + mov, 0);

    const out = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov, movements) => acc + mov, 0);

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate / 100))
        .filter((int, i, arr) => {
            return int >= 1;
        })
        .reduce((acc, int) => acc + int, 0);


    labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);
    labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);

}

/**5. login function logic */

//FAKE LOGIN 
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

/**Timer logic
 * 
 * 1. each time login clear the timers and reset it (multiple logins)
 * 2. but if user stil active ie., doing transfer and request loadn\
 * then it should reset the timer 
 * 
 */

let timer; //needs this timer to persist between different logins 

const startLogoutTimer = function () {
    const tick = function () {
        const minutes = String(Math.trunc(time / 60)).padStart(2, 0);
        const seconds = String(time % 60).padStart(2, 0);

        //in each callback call,print remaining time to UI
        labelTimer.textContent = `${minutes} : ${seconds}`;

        //when time is 0, stop timer and logout user
        if (time === 0) {
            clearInterval(timer);

            //hide the UI
            containerApp.style.opacity = 0;
            labelWelcome.textContent = 'Log in to get started';
        }

        //decrease time
        time--;
    };

    //set time to 2 mins 
    let time = 300;
    tick();
    timer = setInterval(tick, 1000);
    return timer;  //return the timer so it can be used to clear it 
};


/**Login event */
btnLogin.addEventListener('click', function (e) {
    e.preventDefault();
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
    console.log(currentAccount);

    /**display UI and message */
    //if account doesnt exist then wont crash the program 
    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(' ')[0]} `;
        containerApp.style.opacity = 100;

        /**replace the date formatting used manually with intel API */

        /**create current date and format manually without API */
        // const now = new Date();
        // console.log(now.getTimezoneOffset());
        // const day = `${ now.getDate() } `.padStart(2, 0);
        // const month = `${ now.getMonth() + 1 } `.padStart(2, 0);
        // const year = now.getFullYear();
        // const hour = `${ now.getHours() } `.padStart(2, 0);
        // const minutes = `${ now.getMinutes() } `.padStart(2, 0);
        // labelDate.textContent = `${ day } /${month}/${ year } at ${ hour }:${ minutes } `;

        const now = new Date();
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        }
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        /**call the timer function before updating UI */
        //this is to handle timers issue across multiple users
        if (timer) clearInterval(timer);
        timer = startLogoutTimer();

        //update UI
        updateUI(currentAccount);
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur(); //lose focus using blur() method

    }
});


/**6. transfer money logic */
btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();
    const amount = Number(inputTransferAmount.value);
    const receiverAccount = accounts
        .find(acc => acc.username === inputTransferTo.value);
    console.log(amount, receiverAccount);

    //conditions to transfer money
    if (amount > 0
        && receiverAccount
        && currentAccount.balance >= amount
        && receiverAccount?.username !== currentAccount.username) {
        console.log('transfer valid');

        //transfer logic 
        currentAccount.movements.push(-amount);
        receiverAccount.movements.push(amount);

        //update movement dates data 
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAccount.movementsDates.push(new Date().toISOString());

        //update UI
        updateUI(currentAccount);

        //reset timer while use is still active
        clearInterval(timer);
        timer = startLogoutTimer();

    } else {
        console.log('transfer invalid');
    }

    inputTransferAmount.value = inputTransferTo.value = '';
})


/**7. Delete account function */
btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    //check if user credential is correct
    if (inputCloseUsername.value === currentAccount.username
        && Number(inputClosePin.value) === currentAccount.pin) {
        //delete account by index
        const accIndex = accounts.findIndex(acc => acc.username === currentAccount.username);
        accounts.splice(accIndex, 1);

        //hide the UI
        containerApp.style.opacity = 0;
        labelWelcome.textContent = 'Log in to get started';
    }
});


/**8. Request Loan logic */
btnLoan.addEventListener('click', function (e) {
    e.preventDefault();
    const amount = Number(inputLoanAmount.value);

    if (amount > 0 && currentAccount.movements.some(mov =>
        mov >= amount * 0.1)) {

        //set timer for loan request 
        setTimeout(() => {
            currentAccount.movements.push(amount);

            //update movement dates data 
            currentAccount.movementsDates.push(new Date().toISOString());

            updateUI(currentAccount);

            //reset timer while use is still active
            clearInterval(timer);
            timer = startLogoutTimer();
        }, 3000);
    }
    inputLoanAmount.value = "";
});



