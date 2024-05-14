var currentConfig = {}; // Variável global para manter o estado do JSON.

function loadJson() {
    const input = document.getElementById('jsonInput').value;
    currentConfig = JSON.parse(input);
    const editor = document.getElementById('configEditor');
    editor.innerHTML = '';
    Object.keys(currentConfig).forEach(key => {
        handleProperty(key, currentConfig[key], editor, currentConfig);
    });
}

function handleProperty(key, value, parentElement, parentObject) {
    const container = document.createElement('div');
    container.className = 'config-item';
    const label = document.createElement('label');
    label.textContent = key + ": ";
    container.appendChild(label);

    if (Array.isArray(value)) {
        const listContainer = document.createElement('div');
        listContainer.className = 'list-container';
        value.forEach((item, index) => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'list-item';
            handleObjectOrValue(item, itemContainer, value, index);
            listContainer.appendChild(itemContainer);
        });
        container.appendChild(listContainer);
        const addButton = document.createElement('button');
        addButton.textContent = 'Add Item';
        addButton.onclick = () => {
            const newItem = createNewItemBasedOnLast(value);
            value.push(newItem);
            const newItemContainer = document.createElement('div');
            newItemContainer.className = 'list-item';
            handleObjectOrValue(newItem, newItemContainer, value, value.length - 1);
            listContainer.appendChild(newItemContainer);
        };
        container.appendChild(addButton);
    } else if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(subKey => {
            handleProperty(subKey, value[subKey], container, value);
        });
    } else {
        const input = document.createElement('input');
        input.type = typeof value === 'boolean' ? 'checkbox' : 'text';
        input.checked = value;
        input.value = value;
        input.onchange = () => {
            if (input.type === 'checkbox') {
                parentObject[key] = input.checked;
            } else {
                parentObject[key] = input.value;
            }
        };
        container.appendChild(input);
    }
    parentElement.appendChild(container);
}

function generateOutput() {
    const output = document.getElementById('jsonOutput');
    output.value = JSON.stringify(currentConfig, null, 2);
}

function handleObjectOrValue(item, parentContainer, array, index) {
    if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(subKey => {
            handleProperty(subKey, item[subKey], parentContainer, item);
        });
    } else {
        const itemInput = document.createElement('input');
        itemInput.type = 'text';
        itemInput.value = item;
        itemInput.onchange = () => array[index] = itemInput.value;
        parentContainer.appendChild(itemInput);
    }
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => {
        array.splice(index, 1);
        parentContainer.parentNode.removeChild(parentContainer);
    };
    parentContainer.appendChild(removeButton);
}

function createNewItemBasedOnLast(array) {
    if (array.length > 0) {
        const lastItem = array[array.length - 1];
        if (typeof lastItem === 'object' && lastItem !== null) {
            return JSON.parse(JSON.stringify(lastItem)); // Clona o último objeto
        }
    }
    return {}; // Retorna um objeto vazio se a lista estiver vazia ou não tiver objetos
}
