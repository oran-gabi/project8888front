const SERVER = "http://127.0.0.1:5000";

document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    const customerId = localStorage.getItem('customer_id');

    if (!accessToken || !customerId) {
        window.location.href = 'home_client.html';
        return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // Fetch and display customer name
    axios.get(`${SERVER}/customers/${customerId}`)
        .then(response => {
            document.getElementById('customer-name').innerText = response.data.name;
        })
        .catch(error => {
            console.error('Error fetching customer name:', error);
        });

    // Fetch and display current loans
    axios.get(`${SERVER}/client/loans?cust_id=${customerId}`)
        .then(response => {
            const currentLoans = response.data.loans.filter(loan => !loan.returndate);
            displayLoans(currentLoans, 'current-loans');
        })
        .catch(error => {
            console.error('Error fetching current loans:', error);
        });

    // Fetch and display loan history
    axios.get(`${SERVER}/client/loans?cust_id=${customerId}`)
        .then(response => {
            const loanHistory = response.data.loans.filter(loan => loan.returndate);
            displayLoans(loanHistory, 'loan-history');
        })
        .catch(error => {
            console.error('Error fetching loan history:', error);
        });

    // Fetch books and populate dropdown
    axios.get(`${SERVER}/books`)
        .then(response => {
            const bookSelect = document.getElementById('book-id');
            response.data.books.forEach(book => {
                const option = document.createElement('option');
                option.value = book.id;
                option.textContent = book.name;
                bookSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching books:', error);
        });

    // Add new loan
    document.getElementById('add-loan-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const bookId = document.getElementById('book-id').value;
        if (!bookId) {
            alert('Please select a book.');
            return;
        }

        const loanDate = new Date().toISOString().split('T')[0]; // Current date as default

        axios.post(`${SERVER}/client/loans`, { book_id: bookId, loan_date: loanDate })
            .then(response => {
                alert('Loan added successfully!');
                location.reload();
            })
            .catch(error => {
                console.error('Error adding loan:', error);
                alert('Failed to add loan. Please try again.');
            });
    });

    function displayLoans(loans, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        loans.forEach(loan => {
            const loanCard = document.createElement('div');
            loanCard.className = 'loan-card';

            const loanImage = document.createElement('img');
            loanImage.src = `${SERVER}/uploads/${loan.book.image_filename}`;
            loanImage.alt = loan.book.name;
            loanCard.appendChild(loanImage);

            const loanDetails = document.createElement('div');
            loanDetails.className = 'loan-details';

            const bookTitle = document.createElement('h3');
            bookTitle.textContent = loan.book.name;
            loanDetails.appendChild(bookTitle);

            const loanDates = document.createElement('p');
            loanDates.textContent = `Loan Date: ${new Date(loan.loandate).toLocaleDateString()}`;
            loanDetails.appendChild(loanDates);

            if (containerId === 'current-loans') {
                const returnButton = document.createElement('button');
                returnButton.textContent = 'Return Book';
                returnButton.addEventListener('click', () => returnBook(loan.id));
                loanDetails.appendChild(returnButton);
            }

            loanCard.appendChild(loanDetails);
            container.appendChild(loanCard);
        });
    }

    function returnBook(loanId) {
        axios.put(`${SERVER}/client/loans/${loanId}`, { returndate: new Date().toISOString() })
            .then(response => {
                alert('Book returned successfully!');
                location.reload();
            })
            .catch(error => {
                console.error('Error returning book:', error);
                alert('Failed to return book. Please try again.');
            });
    }
});
