// eslint-disable-next-line no-undef
const db = firebase.firestore();
class Txn {
  constructor(type, desc, amt) {
    this.type = type;
    this.desc = desc;
    this.amt = amt;
    // this.id = Math.floor(Date.now() / 1000);
    // console.log(this);
  }
}

class UI {
  static addTxnToList(doc) {
    const list = document.getElementById('txn-list');
    // Create tr element
    const row = document.createElement('tr');
    // Insert cols
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

  // static deleteTxn(target) {
  //   if (target.className === 'delete-txn') {
  //     target.parentElement.parentElement.remove();
  //   }
  // }

  // static editTxn(target) {
  //   if (target.className === 'edit-txn') {
  //     target.parentElement.parentElement.remove();
  //   }
  // }

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
    db.collection('txns')
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          UI.addTxnToList(doc);
        });
      });
    Store.displayAmts();
  }

  static displayAmts() {
    let income = 0;
    let expense = 0;
    db.collection('txns')
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          if (doc.data().type === 'Income') income += parseInt(doc.data().amt);
          else expense += parseInt(doc.data().amt);
        });
      });
    document.getElementById('income-amt').textContent = income;
    document.getElementById('expense-amt').textContent = expense;
    document.getElementById('balance-amt').textContent = income - expense;
  }

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
  if (e.target.parentElement.classList.contains('edit-txn')) {
    // Fill the form with saved values
    UI.fillFields(db.collection('txns').doc(e.target.parentElement.dataset.id));

    Store.removeTxn(e.target.parentElement.dataset.id);
    // UI.editTxn(e.target.parentElement);
  } else if (e.target.parentElement.classList.contains('delete-txn')) {
    Store.removeTxn(e.target.parentElement.dataset.id);
    // UI.deleteTxn(e.target.parentElement);

    // Show message
    UI.showAlert('Transaction Removed!', 'success');
  }
  Store.displayAmts();
  e.preventDefault();
});

db.collection('txns').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      UI.addTxnToList(change.doc);
    } else if (change.type === 'removed') {
      const td = document.querySelector(`[data-id="${change.doc.id}]`);
      td.parentElement.remove();
    }
  });
});
