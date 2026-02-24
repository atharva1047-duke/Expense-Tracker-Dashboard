const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const form = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");
const list = document.getElementById("transactionList");
const toggleBtn = document.getElementById("darkModeToggle");
const filterCategory = document.getElementById("filterCategory");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

if (darkMode) {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️";
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function saveDarkMode() {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);
}

function addTransaction(e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const type = typeInput.value;

    if (!description || !amount || !category || !type || amount <= 0) {
        alert("Please fill all fields correctly.");
        return;
    }

    const transaction = {
        id: Date.now(),
        description,
        amount,
        category,
        type
    };

    transactions.push(transaction);
    saveTransactions();
    updateUI();
    form.reset();
}

function deleteTransaction(id) {
    const confirmDelete = confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) return;

    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
}

function updateUI() {
    list.innerHTML = "";

    if (transactions.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px;'>No transactions yet.</p>";
        updateSummary();
        return;
    }

    const selectedCategory = filterCategory.value;

    const filtered = selectedCategory === "All"
        ? transactions
        : transactions.filter(t => t.category === selectedCategory);

    filtered.forEach(transaction => {
        const li = document.createElement("li");
        li.classList.add(transaction.type.toLowerCase());

        li.innerHTML = `
            <span>
                ${transaction.description} (${transaction.category}) - ${formatCurrency(transaction.amount)}
            </span>
            <button class="delete-btn" data-id="${transaction.id}">X</button>
        `;

        list.appendChild(li);
    });

    updateSummary();
}

function updateSummary() {
    const income = transactions
        .filter(t => t.type === "Income")
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === "Expense")
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    incomeEl.textContent = formatCurrency(income);
    expenseEl.textContent = formatCurrency(expense);
    balanceEl.textContent = formatCurrency(balance);
}

list.addEventListener("click", e => {
    if (e.target.classList.contains("delete-btn")) {
        const id = parseInt(e.target.getAttribute("data-id"));
        deleteTransaction(id);
    }
});

form.addEventListener("submit", addTransaction);

filterCategory.addEventListener("change", updateUI);

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    darkMode = !darkMode;
    toggleBtn.textContent = darkMode ? "☀️" : "🌙";
    saveDarkMode();
});

updateUI();