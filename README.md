# Pokédex

Uma Pokédex web feita com HTML, CSS e JavaScript puros, com visual temático de Pokémon (vermelho, amarelo e pokébolas). Ela mostra o catálogo completo de pokémons, permite ver a ficha de cada um, favoritar, comparar dois pokémons lado a lado e até colocá-los para batalhar.

🔗 **Projeto online:** [ADICIONE AQUI O LINK DO DEPLOY](https://seu-link-aqui)

## Funcionalidades

- **Catálogo:** os 1025 pokémons, com arte oficial, número e tipos, carregados aos poucos pelo botão "Carregar mais".
- **Filtro por tipo:** botões para mostrar só os pokémons de um tipo (fogo, água, planta e os outros 15), que podem ser combinados com a busca.
- **Busca:** campo para digitar o nome ou o número, com sugestões e filtro em tempo real.
- **Aleatório:** botão que sorteia um pokémon e abre a ficha dele.
- **Ficha do pokémon:** descrição, altura, peso, habilidades e barras de atributos.
- **Favoritos:** lista salva no navegador (`localStorage`), que continua ao recarregar a página.
- **Comparador:** dois pokémons lado a lado, com destaque para o maior valor em cada atributo.
- **Batalha:** combate por turnos com ataque físico, ataque especial e defesa, usando a tabela de tipos (super efetivo, pouco efetivo e sem efeito).

## API utilizada

Os dados vêm da [PokéAPI](https://pokeapi.co/), uma API pública e gratuita sobre o universo Pokémon.

- `GET /pokemon?limit=1025` para a lista de nomes
- `GET /pokemon/{id ou nome}` para tipos, atributos, altura, peso e habilidades
- `GET /pokemon-species/{id}` para a descrição
- `GET /type/{nome}` para listar os pokémons de cada tipo (filtro)

As imagens são as artes oficiais do repositório [PokeAPI/sprites](https://github.com/PokeAPI/sprites).

## Tecnologias

- HTML5
- CSS3 (Grid, Flexbox, animações)
- JavaScript (ES6+, `fetch` e `async/await`)
- Fontes do Google Fonts: Titan One, Fredoka, Archivo e DM Sans

## Estrutura

```
pokedex/
├── index.html
├── style.css
└── script.js
```

## Como rodar localmente

1. Baixe ou clone o projeto.
2. Abra o `index.html` no navegador.

Não precisa instalar nada, mas é preciso ter conexão com a internet para acessar a PokéAPI, as imagens e as fontes.

## Créditos

Pokémon e seus nomes são marcas registradas da Nintendo, Game Freak e The Pokémon Company. Este é um projeto sem fins lucrativos, feito para estudo.
