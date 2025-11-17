let currentPage = 1;
let resultsPerPage = 15;
let allResults = [];
const searchBtn = document.getElementById("searchBtn");
const usernameInput = document.getElementById("usernameInput");
const resultsDiv = document.getElementById("results");

// Loading indicator
const loader = document.createElement("p");
loader.textContent = "Searching...";
loader.style.display = "none";
document.body.appendChild(loader);

// Event listener (Step 3)
searchBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();

    if (!username) {
        showError("Please enter a username.");
        return;
    }

    searchUsers(username);
});

usernameInput.addEventListener("input", debounce(() => {
    const username = usernameInput.value.trim();

    if (username.length > 0) {
        searchUsers(username);
    } else {
        clearResults();
    }

}, 600));  // 600ms debounce delay


// Fetch API + async (Step 4 upgraded)
async function searchUsers(query) {
    if (!query.trim()) {
        resultsDiv.innerHTML = "";
        return;
    }

    resultsDiv.innerHTML = "<p>Searching...</p>";

    try {
        const response = await fetch(`https://api.github.com/search/users?q=${query}`);
        const data = await response.json();

        allResults = data.items;       // store all results  
        currentPage = 1;               // reset page  

        renderPage();                  // show first 20  
    } 
    catch (error) {
        resultsDiv.innerHTML = "<p>Error fetching results.</p>";
    }
}

function renderPage() {
    resultsDiv.innerHTML = "";

    let start = (currentPage - 1) * resultsPerPage;
    let end = start + resultsPerPage;

    let pageResults = allResults.slice(start, end);

    if (pageResults.length === 0) {
        resultsDiv.innerHTML = "<p>No results found.</p>";
        return;
    }

    pageResults.forEach(user => {
        resultsDiv.innerHTML += `
            <div class="user-card">
                <img src="${user.avatar_url}" alt="avatar">
                <a href="${user.html_url}" target="_blank">${user.login}</a>
            </div>
        `;
    });

    showPaginationButtons();
}

function showPaginationButtons() {
    let totalPages = Math.ceil(allResults.length / resultsPerPage);

    let paginationDiv = document.createElement("div");
    paginationDiv.className = "pagination";

    if (currentPage > 1) {
        paginationDiv.innerHTML += `<button id="prevPage">Previous</button>`;
    }

    if (currentPage < totalPages) {
        paginationDiv.innerHTML += `<button id="nextPage">Next Page</button>`;
    }

    resultsDiv.appendChild(paginationDiv);

    // event listeners
    if (totalPages > 1) {
        let nextBtn = document.querySelector("#nextPage");
        let prevBtn = document.querySelector("#prevPage");

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                currentPage++;
                renderPage();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                currentPage--;
                renderPage();
            });
        }
    }
}


// Display users (DOM Manipulation) — Step 5
function displayUsers(users) {
    users.forEach(user => {
        const card = document.createElement("div");
        card.className = "user-card";

        card.innerHTML = `
            <img src="${user.avatar_url}">
            <h3>${user.login}</h3>
            <a href="${user.html_url}" target="_blank">View Profile</a>
        `;

        resultsDiv.appendChild(card);
    });
}


// Error handling (Step 6)
function showError(message) {
    clearResults();
    
    const errorMsg = document.createElement("p");
    errorMsg.style.color = "red";
    errorMsg.textContent = message;

    resultsDiv.appendChild(errorMsg);
}

// Clear results helper
function clearResults() {
    resultsDiv.innerHTML = "";
}

// Loading indicator (Step 7)
function showLoader(isVisible) {
    loader.style.display = isVisible ? "block" : "none";
}

function debounce(func, delay) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

