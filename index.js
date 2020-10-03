const contactsList = document.querySelector('.contacts-list-body');
const addButton = document.querySelector('.add-btn');

class Contacts {
  async getContacts() {
    try {
      const response = await fetch('./data.json');

      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  constructor() {
    this.contacts = Storage.getProducts() || [];
  }

  displayContacts(contacts) {
    let result = '';

    contacts.forEach((contact) => {
      result += `
        <tr>
          <td>${contact.name}</td>
          <td>${contact.phone}</td>
          <td class="td td-left">
            <button class="btn" data-id=${contact.id}>
              <i class="fas fa-pen"></i>
            </button>
          </td>
          <td class="td td-right">
            <button class="btn btn-delete" data-id=${contact.id}>
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    });

    contactsList.innerHTML = result;
  }

  addContact() {
    addButton.addEventListener('click', ()  => {
      const userInput = document.getElementById('new-user');
      const phoneInput = document.getElementById('new-phone');
      const errorInput = 'error';

      userInput.className = userInput.value === ''
        ? errorInput
        : userInput.className.replace(/\berror\b/g, "");;

      if (userInput.value !== '' && phoneInput.value !== '' ) {
        const contact = {
          id: new Date().getTime(),
          name: userInput.value,
          phone: phoneInput.value
        };

        this.contacts.push(contact);
        this.displayContacts(this.contacts);
        Storage.saveContacts(this.contacts);
        userInput.value = '';
        phoneInput.value = '';
      }
    });
  }

  deleteContact(id) {
    this.contacts = this.contacts.filter((item) => item.id !== +id);
    console.log(this.contacts);
    Storage.saveContacts(this.contacts);
    // this.displayContacts(this.contacts);
  }

  getDeleteActionButtons() {
    console.log(this.contacts);
    const buttons = [ ...document.querySelectorAll('.btn-delete') ];

    !!buttons?.length && buttons.forEach((item) => {
      const id = item.dataset.id;

      item.addEventListener('click', () => {
        this.deleteContact(id);
      });
    });

    // Storage.saveContacts(contactList);
    // this.displayContacts(contactList);
  }
}

//local storage
class Storage {
  static saveContacts(contacts) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }

  static getProducts() {
    return JSON.parse(localStorage.getItem('contacts'));
  }

  static getProduct(id) {
    let contacts = JSON.parse(localStorage.getItem('contacts'));

    return contacts.find(contact => contact.id === id);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const contacts = new Contacts();

  contacts.getContacts().then(({ users }) => {
    ui.displayContacts(users);
    Storage.saveContacts(users);
  }).then(() => {
    ui.addContact();
    ui.getDeleteActionButtons();
  });
});
