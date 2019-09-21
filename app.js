// eslint-disable-next-line no-undef
const db = firebase.firestore();
db.enablePersistence();

let income = 0;
let expense = 0;
class Txn {
  constructor(type, desc, amt) {
    this.type = type;
    this.desc = desc;
    this.amt = amt;
  }
}

class UI {
  static addTxnToList(doc) {
    const list = document.getElementById('txn-list');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${doc.data().type}</td>
      <td>${doc.data().desc}</td>
      <td>${doc.data().amt}</td>
      <td><a href="#" class="edit-txn" data-id="${doc.id}"><i class="fas fa-edit"></i><a></td>
      <td><a href="#" class="delete-txn" data-id="${doc.id}"><i class="fas fa-trash"></i><a></td>
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

  static clearFields() {
    document.getElementById('type').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('amt').value = '';
  }

  static fillFields(doc) {
    document.getElementById('type').value = doc.data().type;
    document.getElementById('desc').value = doc.data().desc;
    document.getElementById('amt').value = doc.data().amt;
  }

  static displayAmts() {
    document.getElementById('income-amt').textContent = income;
    document.getElementById('expense-amt').textContent = expense;
    document.getElementById('balance-amt').textContent = income - expense;
  }
}

// Storage Class
class Store {
  static addTxn(txn) {
    db.collection('txns').add({
      type: txn.type,
      desc: txn.desc,
      amt: txn.amt,
    });
  }

  static removeTxn(id) {
    db.collection('txns')
      .doc(id)
      .delete();
  }
}

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
    UI.showAlert('Please fill in all fields!', 'error');
  } else if (amt <= 0) {
    UI.showAlert('Please enter a positive amount!', 'error');
  } else {
    Store.addTxn(txn);
    // Show success
    UI.showAlert('Transaction Added!', 'success');
    // Clear fields
    UI.clearFields();
    // UI.displayAmts();
  }
  e.preventDefault();
});

// Event Listener for edit/delete
document.getElementById('txn-list').addEventListener('click', function(e) {
  if (e.target.parentElement.classList.contains('edit-txn')) {
    // Fill the form with saved values
    db.collection('txns')
      .doc(e.target.parentElement.dataset.id)
      .get()
      .then(d => {
        UI.fillFields(d);
        Store.removeTxn(e.target.parentElement.dataset.id);
      });
  } else if (e.target.parentElement.classList.contains('delete-txn')) {
    Store.removeTxn(e.target.parentElement.dataset.id);
    // Show message
    UI.showAlert('Transaction Removed!', 'success');
  }
  // UI.displayAmts();
  e.preventDefault();
});

db.collection('txns').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      if (change.doc.data().type === 'Income') {
        income += parseInt(change.doc.data().amt);
      } else {
        expense += parseInt(change.doc.data().amt);
      }
      UI.addTxnToList(change.doc);
    } else if (change.type === 'removed') {
      if (change.doc.data().type === 'Income') {
        income -= parseInt(change.doc.data().amt);
      } else {
        expense -= parseInt(change.doc.data().amt);
      }
      document.querySelector(`[data-id="${change.doc.id}"]`).parentElement.parentElement.remove();
    }
    UI.displayAmts();
  });
});
