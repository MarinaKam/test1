const contactsList = document.querySelector('.contacts-list-body');
const addButton = document.querySelector('.add-btn');
let usersContacts = [];

const isValidPhone = (phone) => {
  const regex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{2})[-. ]?([0-9]{2})$/;

  if (!phone.match(regex)) {
    alert('You have entered an invalid phone number');
  }

  return !!phone.match(regex);
};

const getNewContact = (contact) => {
  return `
    <td class="td-info">${contact.name}</td>
    <td class="td-info">${contact.phone}</td>
    <td class="td td-left">
      <button class="btn btn-edit" data-id=${contact.id}>
        <i class="fas fa-pen" data-id=${contact.id}></i>
      </button>
    </td>
    <td class="td td-right">
      <button class="btn btn-delete" data-id=${contact.id}>
        <i class="fas fa-trash-alt" data-id=${contact.id}></i>
      </button>
    </td>
  `;
};

const setNewField = (contact) => {
  return `
    <td>
      <input id="edit-user" type="text" name="user">
    </td>
    <td>
      <input id="edit-phone" type="text" name="phone">
    </td>
    <td class="td" colspan="2">
      <button class="btn btn-save" data-id=${contact.id}>
        <i class="far fa-save" data-id=${contact.id}></i>
      </button>
    </td>
  `;
};

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
  displayContacts(contacts) {
    contacts.forEach((contact) => {
      this.createContact(contact);
    });
  }

  submitContact() {
    addButton.addEventListener('click', ()  => {
      const userInput = document.getElementById('new-user');
      const phoneInput = document.getElementById('new-phone');
      const errorInput = 'error';

      if (userInput.value !== '' && phoneInput.value !== '' && isValidPhone(phoneInput.value)) {
        userInput.className = userInput.className.replace(/\berror\b/g, '');
        phoneInput.className = phoneInput.className.replace(/\berror\b/g, '');

        const contact = {
          id: new Date().getTime(),
          name: userInput.value,
          phone: phoneInput.value
        };

        usersContacts.push(contact);
        this.createContact(contact);
        Storage.saveContacts(usersContacts);

        userInput.value = '';
        phoneInput.value = '';
      } else {
        userInput.className = errorInput;
        phoneInput.className = errorInput;
      }
    });
  }

  createContact(contact) {
    const contactEl = document.createElement('tr');
    contactEl.setAttribute('id', contact.id);

    contactEl.innerHTML = getNewContact(contact);
    contactsList.appendChild(contactEl);
  }

  contactLogic() {
    contactsList.addEventListener('click', (event) => {
      if (
        event.target.classList.contains('btn-delete') ||
        event.target.parentElement.classList.contains('btn-delete')
      ) {
        this.deleteContact(event.target.dataset.id);
      }

      if (
        event.target.classList.contains('btn-edit') ||
        event.target.parentElement.classList.contains('btn-edit')
      ) {
        const contact = usersContacts.find((user) => user.id === parseInt(event.target.dataset.id));
        const nodeElem = document.getElementById(contact.id);

        nodeElem.innerHTML = setNewField(contact);

        this.updateContact(contact, event.target, nodeElem);
      }
    });
  }

  deleteContact(id) {
    usersContacts = usersContacts.filter((user) => user.id !== parseInt(id));

    Storage.saveContacts(usersContacts);
    document.getElementById(id)?.remove();
  }

  updateContact(contact, elem, nodeElem) {
    const userInput = document.getElementById('edit-user');
    const phoneInput = document.getElementById('edit-phone');
    const saveButtons = [ ...document.querySelectorAll('.btn-save') ];
    const singleButton = saveButtons.find((item) => item.dataset.id === elem.dataset.id);

    userInput.setAttribute('value', contact.name);
    phoneInput.setAttribute('value', contact.phone);

    singleButton.addEventListener('click', () => {
      if (userInput.value !== '' && phoneInput.value !== '' && isValidPhone(phoneInput.value)) {
        const newContact = {
          id: contact.id,
          name: userInput.value,
          phone: phoneInput.value
        };

        usersContacts = usersContacts.map((user) => (
          user.id === newContact.id ? newContact : user
        ));
        nodeElem.innerHTML = getNewContact(newContact);
        Storage.saveContacts(usersContacts);
      }
    });
  }

  setupApp() {
    usersContacts = Storage.getProducts();

    this.displayContacts(usersContacts);
  }
}

class Storage {
  static saveContacts(contacts) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }

  static getProducts() {
    return localStorage.getItem('contacts')
      ? JSON.parse(localStorage.getItem('contacts'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const contacts = new Contacts();

  contacts.getContacts().then(({ users }) => {
    Storage.saveContacts(users);
  }).then(() => {
    ui.setupApp();
    ui.submitContact();
    ui.contactLogic();
  });
});
