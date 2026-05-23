// Variáveis para armazenar os dados
let grupos = {};
let itens = {};

// Conecta no Firebase na aba 'cardapio'
db.ref('cardapio/grupos').on('value', snapshot => {
    grupos = snapshot.val() || {};
    renderizarCardapio();
});

db.ref('cardapio/itens').on('value', snapshot => {
    itens = snapshot.val() || {};
    renderizarCardapio();
});

// Desenha a tela
function renderizarCardapio() {
    const container = document.getElementById('container-cardapio');
    const chavesGrupos = Object.keys(grupos);

    if (chavesGrupos.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">Nenhum item disponível no momento.</div>`;
        return;
    }

    let html = '';

    // Organiza os grupos em ordem alfabética
    chavesGrupos.sort((a,b) => grupos[a].nome.localeCompare(grupos[b].nome)).forEach(gk => {
        const grupo = grupos[gk];
        
        // Pega os itens desse grupo
        const itensDoGrupo = Object.keys(itens).filter(ik => itens[ik].idGrupo === gk);
        
        // Só desenha o grupo se ele tiver pelo menos 1 item cadastrado
        if (itensDoGrupo.length > 0) {
            html += `<h2 class="grupo-titulo">${grupo.nome}</h2>`;

            // Organiza os itens do grupo
            itensDoGrupo.sort((a,b) => itens[a].nome.localeCompare(itens[b].nome)).forEach(ik => {
                const item = itens[ik];
                
                // Trata a imagem (se não tiver foto, não mostra o espaço vazio)
                let fotoHTML = item.foto 
                    ? `<img src="${item.foto}" class="produto-foto" alt="${item.nome}">` 
                    : '';

                html += `
                    <div class="produto-card">
                        ${fotoHTML}
                        <div class="produto-info">
                            <div class="produto-nome">${item.nome}</div>
                            ${item.descricao ? `<div class="produto-desc">${item.descricao}</div>` : ''}
                            <div class="produto-preco">R$ ${Number(item.preco).toFixed(2).replace('.', ',')}</div>
                        </div>
                    </div>
                `;
            });
        }
    });

    container.innerHTML = html;
}