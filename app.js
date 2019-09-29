// eslint-disable-next-line no-undef
const db = firebase.firestore();
db.enablePersistence();

let income = 0;
let expense = 0;
class Txn {
  constructor(type, desc, amt, date) {
    this.type = type;
    this.desc = desc;
    this.amt = amt;
    this.date = date !== '' ? new Date(date) : new Date();
  }
}

class UI {
  static addTxnToList(doc) {
    const list = document.getElementById('txn-list');
    list.innerHTML += `
    <div class="col s12 m6">
    <div class="card-panel teal center-align">
      <div class="row">
        <div class="col s6">
            <span class="white-text">${doc
              .data()
              .date.toDate()
              .toDateString()}</span>
        </div> 
        <div class="col s4">
            <span class="white-text">${doc.data().type}</span>
        </div>
        <div class="col s2 right">
            <span><a href="#" class="edit-txn" data-id="${
              doc.id
            }"><i class="material-icons white-text">edit</i><a></span>
        </div> 
      </div>
      <div class="row">
        <div class="col s6">
            <span class="white-text">${doc.data().desc}</span>
        </div> 
        <div class="col s4">
            <span class="white-text">${doc.data().amt}</span>
        </div>
        <div class="col s2 right">
            <span><a href="#" class="delete-txn" data-id="${
              doc.id
            }"><i class="material-icons white-text">delete</i><a></span>                  
        </div> 
      </div>
    </div>
    </div>
    `;
  }

  // static showAlert(message, className) {
  //   // Create div
  //   const div = document.createElement('div');
  //   // Add classes
  //   div.className = `alert ${className}`;
  //   // Add text
  //   div.appendChild(document.createTextNode(message));
  //   // Get parent
  //   const container = document.querySelector('#div-form');
  //   // Get form
  //   const form = document.querySelector('#txn-form');
  //   // Insert alert
  //   container.insertBefore(div, form);
  //   // Timeout after 3 sec
  //   setTimeout(function() {
  //     document.querySelector('.alert').remove();
  //   }, 3000);
  // }

  static clearFields() {
    document.getElementById('type').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('amt').value = '';
    document.getElementById('date').value = '';
  }

  static fillFields(doc) {
    document.getElementById('type').value = doc.data().type;
    document.getElementById('desc').value = doc.data().desc;
    document.getElementById('amt').value = doc.data().amt;
    document.getElementById('date').value = doc
      .data()
      .date.toDate()
      .toDateString();
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
      // eslint-disable-next-line no-undef
      date: firebase.firestore.Timestamp.fromDate(txn.date),
    });
  }

  static removeTxn(id) {
    db.collection('txns')
      .doc(id)
      .delete();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  UI.clearFields();
});

// Event Listener for add txn
document.getElementById('txn-form').addEventListener('submit', function(e) {
  // Get form values
  const type = document.getElementById('type').value;
  const desc = document.getElementById('desc').value;
  const amt = document.getElementById('amt').value;
  const date = document.getElementById('date').value;
  // Instantiate txn
  const txn = new Txn(type, desc, amt, date);
  // Validate
  if (type === '' || desc === '' || amt === '') {
    // eslint-disable-next-line no-undef
    M.toast({ html: 'Please fill in all fields!', classes: 'rounded red' });
    // UI.showAlert('Please fill in all fields!', 'error');
  } else if (amt <= 0) {
    // eslint-disable-next-line no-undef
    M.toast({ html: 'Please enter a positive amount!', classes: 'rounded red' });
    // UI.showAlert('Please enter a positive amount!', 'error');
  } else {
    Store.addTxn(txn);
    // Show success
    // eslint-disable-next-line no-undef
    M.toast({ html: 'Transaction Added!', classes: 'rounded green' });
    // UI.showAlert('Transaction Added!', 'success');
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
    // eslint-disable-next-line no-undef
    M.toast({ html: 'Transaction Removed!', classes: 'rounded green' });
    // UI.showAlert('Transaction Removed!', 'success');
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
      document
        .querySelector(`[data-id="${change.doc.id}"]`)
        .parentElement.parentElement.parentElement.parentElement.parentElement.remove();
    }
    UI.displayAmts();
  });
});
