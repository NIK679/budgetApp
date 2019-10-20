/* eslint-disable no-undef */

const db = firebase.firestore();
db.enablePersistence();

document.addEventListener('DOMContentLoaded', () => {
  const elemsSelect = document.querySelectorAll('select');
  // eslint-disable-next-line no-unused-vars
  const instancesSelect = M.FormSelect.init(elemsSelect);
  const elemsDatePicker = document.querySelectorAll('.datepicker');
  // eslint-disable-next-line no-unused-vars
  const instancesDatePicker = M.Datepicker.init(elemsDatePicker, {
    showClearBtn: true,
  });
  const elemsTimePicker = document.querySelectorAll('.timepicker');
  // eslint-disable-next-line no-unused-vars
  const instancesTimePicker = M.Timepicker.init(elemsTimePicker, {
    showClearBtn: true,
  });
});

const list = [];

class Txn {
  constructor(type, desc, amt, date) {
    this.type = type;
    this.desc = desc;
    this.amt = amt;
    this.date = date !== '' ? new Date(date) : new Date();
  }
}

class UI {
  // static addTxnToList(doc) {
  //   const txnList = document.getElementById('txn-list');
  //   txnList.innerHTML += `
  //   <div class="col s12 m6">
  //   <div class="card-panel teal center-align">
  //     <div class="row">
  //       <div class="col s6">
  //           <span class="white-text">${doc
  //             .data()
  //             .date.toDate()
  //             .toDateString()}</span>
  //       </div>
  //       <div class="col s4">
  //           <span class="white-text">${doc.data().type}</span>
  //       </div>
  //       <div class="col s2 right">
  //           <span><a href="#" class="edit-txn" data-id="${
  //             doc.id
  //           }"><i class="material-icons white-text">edit</i><a></span>
  //       </div>
  //     </div>
  //     <div class="row">
  //       <div class="col s6">
  //           <span class="white-text">${doc.data().desc}</span>
  //       </div>
  //       <div class="col s4">
  //           <span class="white-text">${doc.data().amt}</span>
  //       </div>
  //       <div class="col s2 right">
  //           <span><a href="#" class="delete-txn" data-id="${
  //             doc.id
  //           }"><i class="material-icons white-text">delete</i><a></span>
  //       </div>
  //     </div>
  //   </div>
  //   </div>
  //   `;
  // }

  static displayList() {
    let income = 0;
    let expense = 0;
    const txnList = document.getElementById('txn-list');
    txnList.innerHTML = '';
    list.forEach(txn => {
      txnList.innerHTML += `
      <div class="col s12 m6">
      <div class="card-panel teal center-align">
        <div class="row">
          <div class="col s6">
              <span class="white-text">${txn.date.toDateString()}</span>
          </div> 
          <div class="col s4">
              <span class="white-text">${txn.type}</span>
          </div>
          <div class="col s2 right">
              <span><a href="#" class="edit-txn" data-id="${
                txn.id
              }"><i class="material-icons white-text">edit</i><a></span>
          </div> 
        </div>
        <div class="row">
          <div class="col s6">
              <span class="white-text">${txn.desc}</span>
          </div> 
          <div class="col s4">
              <span class="white-text">${txn.amt}</span>
          </div>
          <div class="col s2 right">
              <span><a href="#" class="delete-txn" data-id="${
                txn.id
              }"><i class="material-icons white-text">delete</i><a></span>                  
          </div> 
        </div>
      </div>
      </div>
      `;
      if (txn.type === 'Income') {
        income += parseInt(txn.amt);
      } else {
        expense += parseInt(txn.amt);
      }
    });
    document.getElementById('income-amt').textContent = income;
    document.getElementById('expense-amt').textContent = expense;
    document.getElementById('balance-amt').textContent = income - expense;
  }

  static clearFields() {
    document.getElementById('type').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('amt').value = '';
    document.getElementById('date').value = '';
    document.getElementById('time').value = '';
  }

  static fillFields(doc) {
    document.getElementById('type').value = doc.data().type;
    document.getElementById('desc').value = doc.data().desc;
    document.getElementById('amt').value = doc.data().amt;
    document.getElementById('date').value = doc
      .data()
      .date.toDate()
      .toDateString();
    document.getElementById('time').value = doc
      .data()
      .date.toDate()
      .toTimeString();
  }
}

// Storage Class
class Store {
  static addTxn(txn) {
    db.collection('txns').add({
      type: txn.type,
      desc: txn.desc,
      amt: txn.amt,
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
  const time = document.getElementById('time').value;
  // Validate
  if (type === '' || desc === '' || amt === '') {
    M.toast({ html: 'Please fill in all fields!', classes: 'rounded red' });
    // UI.showAlert('Please fill in all fields!', 'error');
  } else if (amt <= 0) {
    M.toast({ html: 'Please enter a positive amount!', classes: 'rounded red' });
    // UI.showAlert('Please enter a positive amount!', 'error');
  } else if (date === '' && time !== '') {
    M.toast({ html: 'Please choose a date!', classes: 'rounded red' });
  } else {
    // Instantiate txn
    const txn = new Txn(type, desc, amt, `${date} ${time}`);
    Store.addTxn(txn);
    // Show success
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

    M.toast({ html: 'Transaction Removed!', classes: 'rounded green' });
    // UI.showAlert('Transaction Removed!', 'success');
  }
  // UI.displayAmts();
  e.preventDefault();
});

db.collection('txns').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      list.push({
        type: change.doc.data().type,
        desc: change.doc.data().desc,
        amt: change.doc.data().amt,
        date: change.doc.data().date.toDate(),
        id: change.doc.id,
      });
    } else if (change.type === 'removed') {
      document
        .querySelector(`[data-id="${change.doc.id}"]`)
        .parentElement.parentElement.parentElement.parentElement.parentElement.remove();
    }
    UI.displayList();
  });
});
