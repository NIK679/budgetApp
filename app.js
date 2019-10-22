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
  const elemsFAB = document.querySelectorAll('.fixed-action-btn');
  // eslint-disable-next-line no-unused-vars
  const instances = M.FloatingActionButton.init(elemsFAB, {
    hoverEnabled: false,
  });
});

let list = [];

class UI {
  static displayList() {
    let income = 0;
    let expense = 0;
    const txnList = document.getElementById('txn-list');
    txnList.innerHTML = '';
    for (let i = 0; i < list.length; ) {
      const j = i;
      let dBal = 0;
      txnList.innerHTML += `
      <div class="divider"></div>
        <div class="row">
          <br/>
          <div class="col s7">
            <span>${list[i].date.toDateString()}</span>
          </div> 
          <div class="col s5" id="daily-bal-${j}">
            <span>0</span>
          </div>
        </div>`;
      do {
        txnList.innerHTML += `
        <div class="row">
          <div class="col s7">
            <span class="">${list[i].desc}</span>
          </div> 
          <div class="col s3 ${list[i].type === 'Income' ? 'green-text' : 'red-text'}">
            <span >${list[i].type === 'Income' ? '+' : '-'}</span>
            <span >${list[i].amt}</span>
          </div>
          <div class="col s1">
            <span><a href="#" class="edit-txn" data-id="${list[i].id}">
              <i class="material-icons tiny green-text">edit</i><a></span>
          </div>
          <div class="col s1">
            <span><a href="#" class="delete-txn" data-id="${list[i].id}">
              <i class="material-icons tiny red-text">delete</i><a></span>
          </div> 
        </div>`;
        if (list[i].type === 'Income') {
          income += parseInt(list[i].amt);
          dBal += parseInt(list[i].amt);
        } else {
          expense += parseInt(list[i].amt);
          dBal -= parseInt(list[i].amt);
        }
        const dailyBal = document.querySelector(`#daily-bal-${j}`);
        dailyBal.innerHTML = `
        <span class="${dBal >= 0 ? 'blue-text' : 'red-text'}">${Math.abs(dBal)}
        </span>`;
        i += 1;
      } while (i < list.length && list[i - 1].date.toDateString() === list[i].date.toDateString());
    }
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
    M.updateTextFields();
  }
}

// Storage Class
class Store {
  static addTxn(type, desc, amt, date) {
    db.collection('txns').add({
      type,
      desc,
      amt,
      date: firebase.firestore.Timestamp.fromDate(date),
    });
  }

  static removeTxn(id) {
    db.collection('txns')
      .doc(id)
      .delete();
  }
}

// Event Listener for add txn
document.getElementById('txn-form').addEventListener('submit', e => {
  // Get form values
  const type = document.getElementById('type').value;
  const desc = document.getElementById('desc').value;
  const amt = document.getElementById('amt').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  // Validate
  if (type === '' || desc === '' || amt === '') {
    M.toast({ html: 'Please fill in all fields!', classes: 'rounded red' });
  } else if (amt <= 0) {
    M.toast({ html: 'Please enter a positive amount!', classes: 'rounded red' });
  } else if (date === '' && time !== '') {
    M.toast({ html: 'Please choose a date!', classes: 'rounded red' });
  } else {
    const newDate = date === '' ? new Date() : new Date(`${date} ${time}`);
    Store.addTxn(type, desc, amt, newDate);
    // Show success
    M.toast({ html: 'Transaction Added!', classes: 'rounded green' });
    // Clear fields
    UI.clearFields();
  }
  e.preventDefault();
});

// Event Listener for edit/delete
document.getElementById('txn-list').addEventListener('click', e => {
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

document.getElementById('display-txn-form').addEventListener('click', e => {
  txnForm = document.getElementById('txn-form');
  txnForm.innerHTML = `
  <div class="row">
  <div class="input-field col s12">
    <select class="browser-default" id="type">
      <option value="" disabled selected>Choose your option</option>
      <option value="Expense">Expense</option>
      <option value="Income">Income</option>
    </select>
    <label class="active" for="type">Type</label>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <input type="text" id="desc" />
    <label for="desc">Description</label>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <input type="number" id="amt" />
    <label for="amt">Amount</label>
  </div>
</div>
<div class="row">
  <div class="input-field col s6">
    <input class="browser-default" type="date" id="date" />
    <label class="active" for="date">Date</label>
  </div>
  <div class="input-field col s6">
    <input class="browser-default" type="time" id="time" />
    <label class="active" for="time">Time</label>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <input type="submit" value="Submit" class="btn btn-large" />
  </div>
</div>`;
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
      list = list.filter(txn => txn.id !== change.doc.id);
    }
    list.sort((a, b) => b.date - a.date);
    UI.displayList();
  });
});
