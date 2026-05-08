# [CHK] Checker v2.0
### Verificador Gráfico para Crachás, Credenciais e Cordões

Ferramenta web para validar artes gráficas com marcas de **sangria**, **corte** e **segurança** — direto no navegador, sem instalar nada.

---

## Módulos

| # | Módulo | Descrição |
|---|--------|-----------|
| 01 | **Verificação de Arte** | Canvas 456×700px com marcas de margem, suporte a furos e exportação PNG |
| 02 | **Verificação de Cordão** | Canvas 10630×342px para layouts de cordão, com scroll horizontal |
| 03 | **Visualização de Arquivos** | Visualiza PDFs e imagens, converte para JPG |

---

## Estrutura de Arquivos

```
/
├── index.html              # Página inicial
├── index-style.css         # Estilos da home
└── Checker_Documents/
    ├── shared.css               # Estilos compartilhados
    ├── arte.html                # Verificação de Arte
    ├── arte.css
    ├── script.js
    ├── cordao.html              # Verificação de Cordão
    ├── cordao.css
    ├── verificacao-cordao.js
    ├── arquivo.html             # Visualização de Arquivos
    ├── arquivo.css
    └── visualizacao-arquivos.js
```

---

## Deploy no Vercel

1. Faça push deste repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) → **Add New Project**
3. Importe o repositório
4. Configurações:
   - **Framework Preset:** Other
   - **Root Directory:** `/`
   - **Output Directory:** (deixar vazio)
5. Clique em **Deploy** ✅

Não é necessário nenhum build step — o projeto é 100% HTML/CSS/JS estático.

---

## Especificações Técnicas

### Verificação de Arte
- Canvas: **456 × 700 px**
- Sangria: borda externa (ciano)
- Corte: 9.5px / 10.5px internos (vermelho)
- Segurança: 29px / 32px internos (verde)

### Verificação de Cordão
- Canvas: **10630 × 342 px**
- Sangria: borda externa (ciano)
- Corte: 192px / 12px internos (vermelho)
- Segurança: 380px / 22px internos (verde)

---

## Roadmap

- [x] Design v2.0 moderno (dark mode)
- [x] CSS compartilhado entre páginas
- [x] Conversão de imagens para JPG
- [x] Status badge em tempo real
- [ ] Zoom no canvas de arte
- [ ] Suporte a múltiplos tamanhos de crachá
- [ ] Exportação com régua/dimensões
- [ ] Modo claro

---

*Projeto WIP — feedback e contribuições são bem-vindos.*
