// Variáveis para armazenar os dados
let grupos = {};
let itens = {};

// MAPA DE PALAVRAS-CHAVE PARA ÍCONES (Para combinar com os nomes dos grupos)
const iconesPorPalavraChave = {
    'CERVEJA': 'ph ph-beer-mug',
    'CHOPP': 'ph ph-beer-stein',
    'DRINK': 'ph ph-cocktail',
    'COQUETEL': 'ph ph-martini-glass',
    'VINHO': 'ph ph-wine-glass',
    'WHISKY': 'ph ph-whiskey-glass',
    'ENTRADA': 'ph ph-chats-circle',
    'PETISCO': 'ph ph-cookie',
    'PORÇÃO': 'ph ph-tray',
    'BURGER': 'ph ph-hamburger',
    'LANCHE': 'ph ph-sandwich',
    'REFEIÇÃO': 'ph ph-fork-knife',
    'COMIDA': 'ph ph-pizza-slice',
    'SOBREMESA': 'ph ph-cake',
    'SUCO': 'ph ph-drop',
    'REFRIGERANTE': 'ph ph-soda-bottle',
    'DIVERSOS': 'ph ph-confetti',
    // Padrão caso não ache palavra-chave
    'DEFAULT': 'ph ph-circles-four'
};

// Conjunto para rastrear ícones usados e evitar repetição direta
let iconesUsados = new Set();

// FUNÇÃO PARA DETERMINAR O ÍCONE DO GRUPO (Tenta não repetir)
function obterIconeDoGrupo(nomeGrupo) {
    const nomeUp = nomeGrupo.toUpperCase();
    let classIcone = '';

    // Tenta achar palavra-chave no nome do grupo
    for (const [palavra, icone] of Object.entries(iconesPorPalavraChave)) {
        if (nomeUp.includes(palavra)) {
            classIcone = icone;
            break; // Achou o primeiro que combina, para
        }
    }

    // Se não achou em mapa, usa o padrão
    if (!classIcone) {
        classIcone = iconesPorPalavraChave.DEFAULT;
    }

    // Tenta evitar repetição simples (se o ícone já foi usado em outro grupo)
    // Para esta versão simples, vamos aceitar a repetição se o mapa acabar
    // mas se tivéssemos muitos ícones, poderíamos fazer uma lógica mais complexa.
    // Usamos a palavra-chave DEFAULT se for repetido e o mapa acabar.
    
    // iconesUsados.add(classIcone); // Poderíamos usar isso para controle mais fino

    return `<i class="${classIcone}"></i>`;
}

// Conecta no Firebase na aba 'cardapio' (APENAS LEITURA)
db.ref('cardapio/grupos').on('value', snapshot => {
    grupos = snapshot.val() || {};
    renderizarCardapio();
});

db.ref('cardapio/itens').on('value', snapshot => {
    itens = snapshot.val() || {};
    renderizarCardapio();
});

// MOTOR DE RENDERIZAÇÃO MASTER DO CARDÁPIO DIGITAL (CLIENTE)
function renderizarCardapio() {
    const container = document.getElementById('container-cardapio');
    const chavesGrupos = Object.keys(grupos);

    // Reseta ícones usados a cada renderização
    iconesUsados.clear();

    if (chavesGrupos.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b; font-style:italic;">Nenhum item disponível no momento.</div>`;
        return;
    }

    let html = '';

    // Organiza os grupos em ordem alfabética
    // Organiza os grupos pela ORDEM (peso numérico) em vez de ordem alfabética
    chavesGrupos.sort((a,b) => {
        let ordemA = grupos[a].ordem || 0;
        let ordemB = grupos[b].ordem || 0;
        if (ordemA === ordemB) return grupos[a].nome.localeCompare(grupos[b].nome);
        return ordemA - ordemB;
    }).forEach(gk => {
        const grupo = grupos[gk];
        
        // Pega os itens desse grupo
        const itensDoGrupo = Object.keys(itens).filter(ik => itens[ik].idGrupo === gk);
        
        // Só desenha o grupo se ele tiver pelo menos 1 item cadastrado
        if (itensDoGrupo.length > 0) {
            
            // Pega o ícone que combina (Traz bold e sem repetição direta se possível)
            const iconeHTML = obterIconeDoGrupo(grupo.nome);

            // A JANELA QUADRADA DO GRUPO (Cartão Principal Escuro)
            html += `
                <div class="grupo-container">
                    
                    <div class="grupo-header">
                        ${iconeHTML}
                        <span class="grupo-titulo-texto">${grupo.nome}</span>
                    </div>

                    <div class="produtos-lista">
            `;

            // Organiza os itens do grupo em ordem alfabética
            // Organiza os itens pela ORDEM (peso numérico) em vez de ordem alfabética
            itensDoGrupo.sort((a,b) => {
                let ordemA = itens[a].ordem || 0;
                let ordemB = itens[b].ordem || 0;
                if(ordemA === ordemB) return itens[a].nome.localeCompare(itens[b].nome);
                return ordemA - ordemB;
            }).forEach(ik => {
                const item = itens[ik];
                
                // Trata a imagem (Se não tiver foto, não mostra o espaço vazio)
                let fotoHTML = item.foto 
                    ? `<img src="${item.foto}" class="produto-foto" alt="${item.nome}">` 
                    : '';

                // A JANELINHA DO PRODUTO (Fina e escura)
                // A JANELINHA DO PRODUTO (Fina e escura adaptada para a nova classe)
                html += `
                    <div class="produto-card">
                        ${fotoHTML}
                        <div class="produto-info">
                            <div>
                                <div class="produto-nome">${item.nome}</div>
                                ${item.descricao ? `<div class="produto-desc">${item.descricao}</div>` : ''}
                            </div>
                            <div class="produto-preco">R$ ${Number(item.preco).toFixed(2).replace('.', ',')}</div>
                        </div>
                    </div>
                `;
            });

            // Fecha as divs do grupo
            html += `
                    </div> </div> `;
        }
    });

    container.innerHTML = html;
}