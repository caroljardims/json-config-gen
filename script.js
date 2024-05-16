// Função para carregar JSON do input e renderizar o editor de configurações
function loadJson() {
    const jsonInput = document.getElementById('jsonInput').value;
    window.originalJson = JSON.parse(jsonInput); // Guarda o JSON original para comparação
    window.modifiedJson = JSON.parse(jsonInput); // Cria uma cópia do JSON para modificações
    renderEditor(window.modifiedJson);
}

// Função para renderizar o editor de configurações
function renderEditor(data, path = '') {
    const editor = document.getElementById('configEditor');
    editor.innerHTML = ''; // Limpa o editor anterior
    buildEditorUI(data, editor, path);
}

// Função auxiliar para construir a UI de edição baseada no objeto JSON
function buildEditorUI(obj, parentElement, path, level = 0) {
    for (const key in obj) {
        const inputPath = path ? `${path}.${key}` : key;
        const container = document.createElement('div');
        container.className = `level-${level}`; // Adiciona classe baseada no nível
        container.style.marginLeft = `${20 * level}px`; // Indenta baseado no nível

        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            container.innerHTML = `<strong>${key}</strong> <button onclick="removeProperty('${inputPath}')">Remove</button> <button onclick="addProperty('${inputPath}')">Add Property</button><br/>`;
            parentElement.appendChild(container);
            buildEditorUI(obj[key], container, inputPath, level + 1);
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = JSON.stringify(obj[key]);
            input.onchange = (e) => updateJson(inputPath, e.target.value);
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => removeProperty(inputPath);
            container.appendChild(document.createTextNode(key + ': '));
            container.appendChild(input);
            container.appendChild(removeButton);
            container.appendChild(document.createElement('br'));
            parentElement.appendChild(container);
        }
    }
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Property';
    addButton.onclick = () => addProperty(path);
    parentElement.appendChild(addButton);
}


// Função para atualizar o JSON com base nos inputs do usuário
function updateJson(path, value) {
    const paths = path.split('.');
    let current = window.modifiedJson;
    for (let i = 0; i < paths.length - 1; i++) {
        current = current[paths[i]];
    }
    current[paths[paths.length - 1]] = JSON.parse(value);
}

// Função para adicionar uma nova propriedade ao JSON
// Função para adicionar uma nova propriedade ao JSON
function addProperty(path) {
    const keyName = prompt('Enter the key name for the new property:');
    if (!keyName) return;

    const value = prompt('Enter the value for the new property (JSON format):');
    try {
        // Tenta analisar a entrada como JSON. Se falhar, tenta converter strings comuns para formato JSON válido
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        } catch (e) {
            // Se o erro ocorrer porque o valor é uma string simples sem aspas duplas, tenta corrigir adicionando as aspas
            if (/^[\w\s]+$/.test(value.trim())) {
                parsedValue = value.trim();
            } else {
                throw new Error('Please ensure the value is in valid JSON format, including double quotes around strings.');
            }
        }

        // Adiciona a propriedade ao objeto JSON
        if (path) {
            let current = window.modifiedJson;
            const paths = path.split('.');
            paths.forEach(p => current = current[p]);
            current[keyName] = parsedValue;
        } else {
            window.modifiedJson[keyName] = parsedValue;
        }
        renderEditor(window.modifiedJson);
    } catch (e) {
        alert('Invalid JSON value. ' + e.message);
    }
}


// Função para remover uma propriedade do JSON
function removeProperty(path) {
    const paths = path.split('.');
    let current = window.modifiedJson;
    for (let i = 0; i < paths.length - 1; i++) {
        current = current[paths[i]];
    }
    delete current[paths[paths.length - 1]];
    renderEditor(window.modifiedJson);
}

// Função para gerar o JSON de saída com base nas seleções dos checkboxes
// Função para gerar o JSON de saída com base nas seleções dos checkboxes
function generateOutput() {
    const environments = ['QACheckbox', 'MACheckbox', 'SACheckbox', 'SECheckbox'];
    const output = {};
    const rootKey = Object.keys(window.originalJson)[0]; // Assume 'uat' is the root key; dynamic for any single root.

    environments.forEach((env) => {
        const envKey = env.replace('Checkbox', ''); // Transforma 'QACheckbox' em 'QA'
        const jsonData = document.getElementById(env).checked ? JSON.parse(JSON.stringify(window.modifiedJson[rootKey])) : JSON.parse(JSON.stringify(window.originalJson[rootKey]));
        output[envKey] = jsonData;
    });

    document.getElementById('jsonOutput').value = JSON.stringify(output, null, 2);
}

