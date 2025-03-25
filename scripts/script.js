const discountedAlternatives = {
    "milk": 
    { 
        "alternative": "fresh milk", 
        "discount": "20%" 
    },
    "bread":
    { 
        "alternative": "whole grain bread", 
        "discount": "15%" 
    },
    "eggs": 
    { 
        "alternative": "free-range eggs", 
        "discount": "10%" 
    },
    "chicken": 
    { 
        "alternative": "tofu", 
        "discount": "20%" 
    },
    "beef": 
    { 
        "alternative": "plant-based beef", 
        "discount": "15%" 
    },
  };
  
  const inventory = [];
  
  document.addEventListener('DOMContentLoaded', function() {

    displayInventory();
    
    document.getElementById('add-item-form').addEventListener('submit', function(e) {
      e.preventDefault();
      addItem();
    });
    
    document.getElementById('generate-list-btn').addEventListener('click', generateShoppingList);
  });
  
  function addItem() {
    const itemName = document.getElementById('item-name').value.trim().toLowerCase();
    const itemQuantity = parseInt(document.getElementById('item-quantity').value);
    const itemExpiry = document.getElementById('item-expiry').value;
    
    const newItem = {
      id: Date.now(),
      name: itemName,
      quantity: itemQuantity,
      expiry: itemExpiry
    };
    
    inventory.push(newItem);
    
    saveInventory();
    
    displayInventory();
    
    document.getElementById('add-item-form').reset();
  }
  
  function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }
  
  function displayInventory() {
    const inventoryBody = document.getElementById('inventory-body');
    inventoryBody.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (inventory.length === 0) {
      inventoryBody.innerHTML = '<tr><td colspan="4" class="text-center">No items in inventory</td></tr>';
      return;
    }
    
    inventory.forEach(item => {
      const expiryDate = new Date(item.expiry);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      let rowClass = '';
      if (daysToExpiry < 0) {
        rowClass = 'table-danger';
      } else if (daysToExpiry <= 3) {
        rowClass = 'table-warning';
      }
      
      const row = document.createElement('tr');
      row.className = rowClass;
      
      const formattedExpiry = new Date(item.expiry).toLocaleDateString();
      
      row.innerHTML = `
        <td>${item.name.charAt(0).toUpperCase() + item.name.slice(1)}</td>
        <td>${item.quantity}</td>
        <td>${formattedExpiry}</td>
      `;
      
      inventoryBody.appendChild(row);
    });
  }
  
  function generateShoppingList() {
    const shoppingList = document.getElementById('shopping-list');
    const discountSuggestions = document.getElementById('discount-suggestions');
    
    shoppingList.innerHTML = '';
    
    const lowStockItems = inventory.filter(item => item.quantity <= 2);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiredItems = inventory.filter(item => {
      const expiryDate = new Date(item.expiry);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate <= today;
    });
    
    const itemsToRestock = [...new Set([...lowStockItems, ...expiredItems])];
    
    if (itemsToRestock.length === 0) {
      shoppingList.innerHTML = '<li class="list-group-item">No items need restocking</li>';
      discountSuggestions.textContent = 'No discounted alternatives available at this time.';
      return;
    }
    
    let discountHTML = '<ul class="list-group">';
    let hasDiscount = false;
    
    itemsToRestock.forEach(item => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      const reason = item.quantity <= 2 ? 'Low stock' : 'Expired';
      listItem.innerHTML = `
        <div>
          <strong>${item.name.charAt(0).toUpperCase() + item.name.slice(1)}</strong>
          <span class="badge ${reason === 'Low stock' ? 'bg-warning' : 'bg-danger'} ms-2">${reason}</span>
        </div>
        <span>Quantity: ${item.quantity}</span>
      `;
      
      shoppingList.appendChild(listItem);
      
      if (discountedAlternatives[item.name.toLowerCase()]) {
        hasDiscount = true;
        const alt = discountedAlternatives[item.name.toLowerCase()];
        discountHTML += `
          <li class="list-group-item">
            Instead of <strong>${item.name}</strong>, try <strong>${alt.alternative}</strong> (${alt.discount} off)
          </li>
        `;
      }
    });
    
    discountHTML += '</ul>';
    
    if (hasDiscount) {
      discountSuggestions.innerHTML = discountHTML;
    } else {
      discountSuggestions.textContent = 'No discounted alternatives available for these items.';
    }
  }