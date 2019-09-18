class Txn {
  constructor(type, desc, amt) {
    this.type = type;
    this.desc = desc;
    this.amt = amt;
    this.id = Math.floor(Date.now() / 1000);
    // console.log(this);
  }
}

class UI {
  static addTxnToList(txn) {
    const list = document.getElementById('txn-list');
    // Create tr element
    const row = document.createElement('tr');
    // Insert cols
    row.innerHTML = `
      <td>${txn.type}</td>
      <td>${txn.desc}</td>
      <td>${txn.amt}</td>
      <td><a href="#" class="edit" data-id="${txn.id}">E<a></td>
      <td><a href="#" class="delete" data-id="${txn.id}">X<a></td>
    `;

    list.appendChild(row);
  }

  static showAlert(message, className) {
    // Create div
    const div = document.createElement('div');
    // Add classes
    div.className = `alert ${className}`;
    // Add text
    div.appendChild(document.createTextNode(message));
    // Get parent
    const container = document.querySelector('.container');
    // Get form
    const form = document.querySelector('#txn-form');
    // Insert alert
    container.insertBefore(div, form);

    // Timeout after 3 sec
    setTimeout(function() {
      document.querySelector('.alert').remove();
    }, 3000);
  }

  static deleteTxn(target) {
    if (target.className === 'delete') {
      target.parentElement.parentElement.remove();
    }
  }

  static editTxn(target) {
    if (target.className === 'edit') {
      target.parentElement.parentElement.remove();
    }
  }

  static clearFields() {
    document.getElementById('type').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('amt').value = '';
  }
}

// Local Storage Class
class Store {
  static getTxns() {
    let txns;
    if (localStorage.getItem('txns') === null) {
      txns = [];
    } else {
      txns = JSON.parse(localStorage.getItem('txns'));
    }

    return txns;
  }

  static displayTxns() {
    const txns = Store.getTxns();
    txns.forEach(txn => {
      UI.addTxnToList(txn);
    });
    Store.displayAmts();
  }

  static displayAmts() {
    const txns = Store.getTxns();
    let income = 0;
    let expense = 0;
    txns.forEach(txn => {
      if (txn.type === 'Income') income += parseInt(txn.amt);
      else expense += parseInt(txn.amt);
    });
    document.getElementById('income-amt').textContent = income;
    document.getElementById('expense-amt').textContent = expense;
    document.getElementById('balance-amt').textContent = income - expense;
  }

  static addTxn(txn) {
    const txns = Store.getTxns();

    txns.push(txn);

    localStorage.setItem('txns', JSON.stringify(txns));
  }

  static removeTxn(id) {
    const txns = Store.getTxns();

    txns.forEach(function(txn, index) {
      if (txn.id === id) {
        txns.splice(index, 1);
      }
    });

    localStorage.setItem('txns', JSON.stringify(txns));
  }
}

// DOM Load Event
document.addEventListener('DOMContentLoaded', Store.displayTxns);

// Event Listener for add txn
document.getElementById('txn-form').addEventListener('submit', function(e) {
  // Get form values
  const type = document.getElementById('type').value;
  const desc = document.getElementById('desc').value;
  const amt = document.getElementById('amt').value;

  // Instantiate txn
  const txn = new Txn(type, desc, amt);

  // Validate
  if (type === '' || desc === '' || amt === '') {
    // Error alert
    UI.showAlert('Please fill in all fields!', 'error');
  } else if (amt <= 0) {
    UI.showAlert('Please enter a positive amount!', 'error');
  } else {
    // Add txn to list
    UI.addTxnToList(txn);

    // Add to LS
    Store.addTxn(txn);

    // Show success
    UI.showAlert('Transaction Added!', 'success');

    // Clear fields
    UI.clearFields();

    Store.displayAmts();
  }

  e.preventDefault();
});

// Event Listener for delete
document.getElementById('txn-list').addEventListener('click', function(e) {
  if (e.target.classList.contains('edit')) {
    const txns = Store.getTxns();
    const txn = txns.filter(t => t.id === parseInt(e.target.dataset.id));
    // Fill the form with saved values
    document.getElementById('type').value = txn[0].type;
    document.getElementById('desc').value = txn[0].desc;
    document.getElementById('amt').value = txn[0].amt;
    Store.removeTxn(parseInt(e.target.dataset.id));
    UI.editTxn(e.target);
  } else if (e.target.classList.contains('delete')) {
    Store.removeTxn(parseInt(e.target.dataset.id));
    UI.deleteTxn(e.target);

    // Show message
    UI.showAlert('Transaction Removed!', 'success');
  }
  Store.displayAmts();
  e.preventDefault();
});
